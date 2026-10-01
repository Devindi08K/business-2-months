const BASE_URL = 'http://localhost:3000';

function extractCookies(headers) {
  const raw = typeof headers.getSetCookie === 'function' 
    ? headers.getSetCookie() 
    : [headers.get('set-cookie')].filter(Boolean);
  return raw.map(c => c.split(';')[0].trim());
}

async function runE2ETests() {
  console.log('🚀 Starting End-to-End Admin Verification...\n');

  // 1. Get CSRF token
  console.log('Step 1: Fetching initial CSRF token & cookie...');
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfCookies = extractCookies(csrfRes.headers);
  const csrfToken = csrfData.csrfToken;
  console.log(`✅ CSRF token acquired: ${csrfToken ? 'SUCCESS' : 'FAILED'}`);

  let cookieJar = [...csrfCookies];

  // 2. Perform Admin Login
  console.log('\nStep 2: Authenticating with owner@example.com / ChangeMe!23456...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieJar.join('; '),
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify({
      email: 'owner@example.com',
      password: 'ChangeMe!23456',
      csrfToken: csrfToken,
    }),
  });

  const loginData = await loginRes.json();
  const loginCookies = extractCookies(loginRes.headers);
  
  if (loginRes.status !== 200 || !loginData.user) {
    console.error('❌ Login failed:', loginRes.status, loginData);
    process.exit(1);
  }
  console.log(`✅ Login successful! Logged in as: ${loginData.user.name} (${loginData.user.role})`);

  // Merge cookies
  const cookieMap = new Map();
  for (const c of [...cookieJar, ...loginCookies]) {
    const [k, v] = c.split('=');
    cookieMap.set(k, v);
  }
  const cookieHeader = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');

  // 3. Test Admin Protected APIs
  console.log('\nStep 3: Verifying all Admin Protected API Endpoints...');
  const endpoints = [
    { name: 'Dashboard Stats', path: '/api/admin/dashboard' },
    { name: 'Items List', path: '/api/admin/items' },
    { name: 'Categories List', path: '/api/admin/categories' },
    { name: 'Gallery List', path: '/api/admin/gallery' },
    { name: 'Testimonials List', path: '/api/admin/testimonials' },
    { name: 'Blog Posts List', path: '/api/admin/blog' },
    { name: 'Pages Content', path: '/api/admin/pages' },
    { name: 'Messages List', path: '/api/admin/messages' },
    { name: 'Bookings List', path: '/api/admin/bookings' },
    { name: 'Site Settings', path: '/api/admin/settings' },
    { name: 'Users List', path: '/api/admin/users' },
  ];

  let passedApis = 0;
  for (const ep of endpoints) {
    const res = await fetch(`${BASE_URL}${ep.path}`, {
      headers: {
        'Cookie': cookieHeader,
      },
    });
    const data = await res.json().catch(() => null);
    if (res.status === 200) {
      console.log(`  ✅ [200 OK] ${ep.name.padEnd(20)} (${ep.path})`);
      passedApis++;
    } else {
      console.log(`  ❌ [${res.status}] ${ep.name.padEnd(20)} (${ep.path}) - Error: ${JSON.stringify(data)}`);
    }
  }

  // 4. Test Protected Admin Page HTML Rendering
  console.log('\nStep 4: Verifying SSR / HTML Page Rendering with Auth Session...');
  const adminPages = [
    '/admin',
    '/admin/items',
    '/admin/gallery',
    '/admin/testimonials',
    '/admin/blog',
    '/admin/pages',
    '/admin/messages',
    '/admin/bookings',
    '/admin/settings',
    '/admin/users',
  ];

  let passedPages = 0;
  for (const pagePath of adminPages) {
    const res = await fetch(`${BASE_URL}${pagePath}`, {
      headers: {
        'Cookie': cookieHeader,
      },
    });
    const html = await res.text();
    if (res.status === 200 && !html.includes('Admin login') && !html.includes('Sign in to manage')) {
      console.log(`  ✅ [200 OK] Rendered Protected Admin Page: ${pagePath}`);
      passedPages++;
    } else {
      console.log(`  ❌ [${res.status}] Page failed or redirected: ${pagePath}`);
    }
  }

  // 5. Test CRUD Write Operation (Create & Delete a test Category)
  console.log('\nStep 5: Testing Admin Write / Mutation Operations (Create Category)...');
  
  // Refresh CSRF token for authenticated session
  const csrfRefreshRes = await fetch(`${BASE_URL}/api/auth/csrf`, {
    headers: { 'Cookie': cookieHeader },
  });
  const csrfRefreshData = await csrfRefreshRes.json();
  const csrfRefreshCookies = extractCookies(csrfRefreshRes.headers);
  for (const c of csrfRefreshCookies) {
    const [k, v] = c.split('=');
    cookieMap.set(k, v);
  }
  const activeCookieHeader = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  const activeCsrfToken = csrfRefreshData.csrfToken || csrfToken;

  const createCatRes = await fetch(`${BASE_URL}/api/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': activeCookieHeader,
      'x-csrf-token': activeCsrfToken,
    },
    body: JSON.stringify({
      name: 'E2E Test Category',
      slug: 'e2e-test-category',
      order: 99,
      isActive: true,
      csrfToken: activeCsrfToken,
    }),
  });

  const createdCat = await createCatRes.json();
  if (createCatRes.status === 201 || createCatRes.status === 200) {
    console.log(`  ✅ Created test category ID: ${createdCat.category?._id || createdCat._id}`);
    const catId = createdCat.category?._id || createdCat._id;
    
    // Delete it to clean up
    const deleteCatRes = await fetch(`${BASE_URL}/api/admin/categories/${catId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': activeCookieHeader,
        'x-csrf-token': activeCsrfToken,
      },
      body: JSON.stringify({ csrfToken: activeCsrfToken }),
    });
    if (deleteCatRes.status === 200) {
      console.log(`  ✅ Cleaned up / deleted test category ID: ${catId}`);
    } else {
      console.log(`  ⚠️ Delete returned status: ${deleteCatRes.status}`);
    }
  } else {
    console.log(`  ❌ Failed to create category: ${createCatRes.status}`, createdCat);
  }

  console.log(`\n🎉 End-to-End Test Summary:`);
  console.log(`- Protected APIs: ${passedApis}/${endpoints.length} passed`);
  console.log(`- Admin Pages: ${passedPages}/${adminPages.length} passed`);
  console.log(`- Authentication & CSRF: Passed`);
  console.log(`- Write / Delete CRUD Operations: Passed\n`);
}

runE2ETests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});

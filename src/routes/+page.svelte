

<script lang="ts">
    let studentId = $state('S1001');
    let userToken = $state('');
    let role = $state<'student' | 'teacher'>('student');

    let loading = $state(false);
    let error = $state('');
    let message = $state('');
    let student = $state<any>(null);
    let insights = $state<any>(null);
    let classSummary = $state<any>(null);

    function openDashboard(selectedRole: 'student' | 'teacher') {
        role = selectedRole;

        document.getElementById('access-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    async function apiRequest(path: string) {
        const response = await fetch(`/api/${path}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ?? data.error ?? `Request failed (${response.status})`
            );
        }

        return data;
    }

    async function loadStudentDashboard() {
        error = '';
        message = '';
        student = null;
        insights = null;
        classSummary = null;
        loading = true;

        try {
            if (!userToken.trim()) {
                throw new Error('Enter your demo user token first.');
            }

            if (role === 'student') {
                student = await apiRequest('students/me');

                insights = await apiRequest(
                    `students/${encodeURIComponent(studentId)}/insights`
                );
            } else {
                classSummary = await apiRequest('teacher/class-summary');
            }

            message = 'Data loaded successfully.';
        } catch (e) {
            error = e instanceof Error
                ? e.message
                : 'Unable to load data.';
        } finally {
            loading = false;
        }
    }
</script>


<svelte:head>
    <title>Academic Insights | Secure Student AI</title>
    <meta
        name="description"
        content="Secure academic insights and student performance dashboard."
    />
</svelte:head>

<div class="app-shell">
    
<header class="topbar">
    <a class="brand" href="#home" aria-label="Secure Student AI home">
        <div class="brand-mark">A</div>
        <div>
            <h1>Academic Insights</h1>
            <p>Secure Student AI</p>
        </div>
    </a>

    
<nav class="main-nav" aria-label="Main navigation">
    <a href="#home">Home</a>

    <a
        href="#access-form"
        onclick={() => openDashboard('student')}
    >
        Student
    </a>

    <a
        href="#access-form"
        onclick={() => openDashboard('teacher')}
    >
        Teacher
    </a>

    <a href="#security">Security</a>
</nav>


    <span class="security-label">SECURE API</span>
</header>

    <main>
        
<section class="hero" id="home">
    <p class="eyebrow">ACADEMIC PERFORMANCE PLATFORM</p>

    <h2>Turn academic data into <span>meaningful insights.</span></h2>

    <p class="hero-text">
        Review student performance, attendance and personalised
        study recommendations through a security-protected API.
    </p>

    <div class="hero-actions">
        <button
            type="button"
            onclick={() => openDashboard('student')}
        >
            Student Dashboard
        </button>

        <button
            type="button"
            class="secondary-button"
            onclick={() => openDashboard('teacher')}
        >
            Teacher Dashboard
        </button>
    </div>
</section>


        <section class="access-card" id="access-form">
            <div class="section-heading">
                <div>
                    <p class="eyebrow">DEMO ACCESS</p>
                    <h3>Open your dashboard</h3>
                </div>
                <span class="lock-icon">Protected</span>
            </div>

            <form onsubmit={(event) => { event.preventDefault(); loadStudentDashboard(); }}>
                <label for="role">Access role</label>
                <select id="role" bind:value={role}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>

                {#if role === 'student'}
                    <label for="studentId">Student ID for insights</label>
                    <input
                        id="studentId"
                        bind:value={studentId}
                        placeholder="e.g. S1001"
                        required
                    />
                {/if}

                <label for="token">Demo user token</label>
                <input
                    id="token"
                    type="password"
                    bind:value={userToken}
                    placeholder="Enter your assigned demo token"
                    autocomplete="off"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Loading dashboard...' : 'View academic insights'}
                </button>
            </form>

            <p class="security-note">
                Your request is sent through a server-side proxy. The API key
                is kept on the server and is not entered into this form.
            </p>
        </section>

        {#if error}
            <div class="notice error" role="alert">
                <strong>Request unsuccessful</strong>
                <p>{error}</p>
            </div>
        {/if}

        {#if message}
            <div class="notice success" role="status">{message}</div>
        {/if}

        
{#if student}
    <section class="results" id="student-dashboard">
        <div class="results-heading">
            <div>
                <p class="eyebrow">STUDENT OVERVIEW</p>
                <h3>Welcome, {student.name ?? student.student_id}</h3>
            </div>
            <span class="role-pill">Student</span>
        </div>

        <div class="data-card">
            <h4>Student details</h4>
            <table>
                <tbody>
                    <tr>
                        <th>Student ID</th>
                        <td>{student.student_id}</td>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <td>{student.name}</td>
                    </tr>
                    <tr>
                        <th>Attendance</th>
                        <td>{student.attendance}%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {#if insights}
            <div class="data-card">
                <h4>Academic performance</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Marks</th>
                            <th>Target</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each Object.entries(insights.subject_marks) as [subject, marks]}
                            <tr>
                                <td>{subject}</td>
                                <td>{marks}</td>
                                <td>{insights.target_marks}</td>
                                <td>
                                    <span class:needs-improvement={Number(marks) < insights.target_marks}
                                          class:target-met={Number(marks) >= insights.target_marks}
                                          class="status-pill">
                                        {Number(marks) < insights.target_marks
                                            ? 'Needs improvement'
                                            : 'Target met'}
                                    </span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="data-card">
                <h4>Academic insights</h4>
                <table>
                    <tbody>
                        <tr>
                            <th>Overall average</th>
                            <td>{insights.overall_average}</td>
                        </tr>
                        <tr>
                            <th>Target marks</th>
                            <td>{insights.target_marks}</td>
                        </tr>
                        <tr>
                            <th>Subjects below target</th>
                            <td>
                                {insights.subjects_below_target.length > 0
                                    ? insights.subjects_below_target.join(', ')
                                    : 'None'}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="recommendation">
                    <h4>Study recommendation</h4>
                    <p>{insights.recommendation}</p>
                    <small>{insights.note}</small>
                </div>
            </div>
        {/if}
    </section>
{/if}
       

{#if classSummary}
    <section class="results" id="teacher-dashboard">
        <div class="results-heading">
            <div>
                <p class="eyebrow">TEACHER OVERVIEW</p>
                <h3>Class performance summary</h3>
                <p class="hero-text">
                    Academic performance across the class
                </p>
            </div>
            <span class="role-pill">Teacher</span>
        </div>

        <!-- Summary Cards -->
        <div class="summary-grid">
            <article class="summary-card">
                <p>Total Students</p>
                <h3>{classSummary.class_size}</h3>
                <span>Students in the class</span>
            </article>

            <article class="summary-card">
                <p>Class Average</p>
                
<h3>
    {classSummary.students.length
        ? (
            classSummary.students.reduce(
                (total: number, item: { overall_average: number }) =>
                    total + item.overall_average,
                0
            ) / classSummary.students.length
        ).toFixed(2)
        : '—'}
</h3>

                <span>Average marks across students</span>
            </article>

            <article class="summary-card">
                <p>Average Attendance</p>
                
<h3>
    {classSummary.students.length
        ? (
            classSummary.students.reduce(
                (total: number, item: { attendance: number }) =>
                    total + item.attendance,
                0
            ) / classSummary.students.length
        ).toFixed(2) + '%'
        : '—'}
</h3>

                <span>Mean attendance percentage</span>
            </article>

            <article class="summary-card">
                <p>Students Below 60</p>
                <h3>
                    {classSummary.students.filter(
                        item => item.overall_average < 60
                    ).length}
                </h3>
                <span>Students with an average below 60 marks</span>
            </article>
        </div>

        <!-- Class Summary Table -->
        <div class="data-card">
            <h4>Class summary</h4>

            <table>
                <tbody>
                    {#each Object.entries(classSummary) as [key, value]}
                        {#if !Array.isArray(value) && typeof value !== 'object'}
                            <tr>
                                <th>
                                    {key
                                        .replaceAll('_', ' ')
                                        .replace(/\b\w/g, c => c.toUpperCase())}
                                </th>
                                <td>{String(value ?? '—')}</td>
                            </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Student Performance Table -->
        {#each Object.entries(classSummary) as [key, value]}
            {#if Array.isArray(value) &&
                value.length > 0 &&
                typeof value[0] === 'object' &&
                value[0] !== null}
                <div class="data-card">
                    <h4>
                        {key
                            .replaceAll('_', ' ')
                            .replace(/\b\w/g, c => c.toUpperCase())}
                    </h4>

                    <table>
                        <thead>
                            <tr>
                                {#each Object.keys(value[0]) as column}
                                    <th>
                                        {column
                                            .replaceAll('_', ' ')
                                            .replace(/\b\w/g, c => c.toUpperCase())}
                                    </th>
                                {/each}
                            </tr>
                        </thead>

                        <tbody>
                            {#each value as row}
                                <tr>
                                    {#each Object.values(row) as cell}
                                        <td>{String(cell ?? '—')}</td>
                                    {/each}
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        {/each}
    </section>
{/if}



        <section class="security-section" id="security">
            <p class="eyebrow">BUILT WITH SECURITY IN MIND</p>
            <div class="security-grid">
                <article>
                    <span>01</span>
                    <h4>API-key authentication</h4>
                    <p>Requests are checked before accessing the backend.</p>
                </article>
                <article>
                    <span>02</span>
                    <h4>Role-based access</h4>
                    <p>Students and teachers have different permissions.</p>
                </article>
                <article>
                    <span>03</span>
                    <h4>Input validation</h4>
                    <p>Invalid inputs are rejected by the API.</p>
                </article>
            </div>
        </section>
    </main>

    <footer>
        <p>Secure Student Records & Academic Insights AI</p>
        <p>Demonstration uses synthetic student data.</p>
    </footer>
</div>

<style>
    :global(*) {
        box-sizing: border-box;
    }

    :global(body) {
        margin: 0;
        background: #f5f7fb;
        color: #172033;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .app-shell {
        min-height: 100vh;
    }

    .topbar {
        min-height: 76px;
        padding: 16px max(6%, calc((100% - 1120px) / 2));
        background: #fff;
        border-bottom: 1px solid #e7eaf1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .brand-mark {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: #243b80;
        color: #fff;
        font-size: 22px;
        font-weight: 800;
    }

    .brand h1, .brand p, .hero p, .results-heading h3 {
        margin: 0;
    }

    .brand h1 {
        font-size: 17px;
    }

    .brand p {
        margin-top: 3px;
        color: #748098;
        font-size: 12px;
    }

    .security-label, .role-pill {
        padding: 7px 11px;
        border-radius: 20px;
        background: #eaf7f0;
        color: #18784b;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .5px;
    }

    main {
        max-width: 1000px;
        margin: auto;
        padding: 52px 22px 70px;
    }

    .hero {
        max-width: 700px;
        margin: 0 auto 35px;
        text-align: center;
    }

    .eyebrow {
        color: #566fbd;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.5px;
    }

    .hero h2 {
        margin: 15px 0;
        font-size: clamp(30px, 5vw, 45px);
        line-height: 1.15;
        letter-spacing: -1.5px;
    }

    .hero h2 span {
        color: #526ac1;
    }

    .hero-text {
        max-width: 580px;
        margin: auto !important;
        color: #68748a;
        font-size: 15px;
        line-height: 1.8;
    }

    .access-card, .data-card {
        background: #fff;
        border: 1px solid #e6eaf2;
        border-radius: 18px;
        box-shadow: 0 10px 35px rgb(30 45 80 / 5%);
    }

    .access-card {
        max-width: 560px;
        margin: 0 auto;
        padding: 28px;
    }

    .section-heading, .results-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
    }

    .section-heading h3 {
        margin: 7px 0 0;
        font-size: 22px;
    }

    .lock-icon {
        color: #27845a;
        font-size: 12px;
        font-weight: 700;
    }

    form {
        display: grid;
        gap: 10px;
    }

    label {
        margin-top: 9px;
        color: #38445a;
        font-size: 13px;
        font-weight: 700;
    }

    input, select {
        width: 100%;
        min-height: 46px;
        padding: 12px 13px;
        border: 1px solid #dce2ed;
        border-radius: 9px;
        background: #fff;
        color: #172033;
        font: inherit;
        outline: none;
    }

    input:focus, select:focus {
        border-color: #526ac1;
        box-shadow: 0 0 0 3px rgb(82 106 193 / 12%);
    }

    button {
        margin-top: 12px;
        min-height: 48px;
        border: 0;
        border-radius: 9px;
        background: #283e84;
        color: #fff;
        font-size: 14px;
        font-weight: 750;
        cursor: pointer;
    }

    button:hover {
        background: #1f3069;
    }

    button:disabled {
        opacity: .65;
        cursor: wait;
    }

    .security-note {
        margin: 18px 0 0;
        color: #748098;
        font-size: 12px;
        line-height: 1.7;
    }

    .notice, .results {
        max-width: 760px;
        margin: 25px auto;
    }

    .notice {
        padding: 15px 18px;
        border-radius: 10px;
        font-size: 13px;
    }

    .notice p {
        margin-bottom: 0;
    }

    .error {
        background: #fff0f0;
        color: #a32929;
        border: 1px solid #f5d0d0;
    }

    .success {
        background: #eaf7f0;
        color: #18784b;
    }

    .results {
        margin-top: 45px;
    }

    .results-heading h3 {
        margin-top: 6px;
        font-size: 24px;
    }

    .data-card {
        padding: 22px;
        margin: 15px 0;
        overflow: hidden;
    }

    .data-card h4 {
        margin: 0 0 15px;
    }

    pre {
        margin: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        color: #45516a;
        font-size: 12px;
        line-height: 1.7;
    }

    .security-section {
        margin-top: 65px;
    }

    .security-section > .eyebrow {
        text-align: center;
    }

    .security-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
        margin-top: 20px;
    }

    .security-grid article {
        padding: 22px;
        background: #fff;
        border: 1px solid #e6eaf2;
        border-radius: 14px;
    }

    .security-grid article > span {
        color: #526ac1;
        font-size: 12px;
        font-weight: 800;
    }

    .security-grid h4 {
        margin: 15px 0 8px;
        font-size: 15px;
    }

    .security-grid p {
        margin: 0;
        color: #748098;
        font-size: 13px;
        line-height: 1.7;
    }

    footer {
        padding: 25px 20px;
        border-top: 1px solid #e6eaf2;
        background: #fff;
        color: #748098;
        text-align: center;
        font-size: 12px;
    }

    footer p {
        margin: 5px;
    }

    @media (max-width: 650px) {
        main {
            padding: 35px 16px 50px;
        }

        .access-card {
            padding: 21px;
        }

        .security-grid {
            grid-template-columns: 1fr;
        }

        .hero h2 {
            letter-spacing: -.7px;
        }
    }

    
table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
}

th,
td {
    padding: 13px 15px;
    border-bottom: 1px solid #e8ecf3;
    vertical-align: top;
}

thead th {
    background: #f5f7fc;
    color: #38445a;
    font-weight: 700;
}

tbody th {
    width: 38%;
    color: #68748a;
    font-weight: 600;
}

tbody tr:last-child th,
tbody tr:last-child td {
    border-bottom: none;
}

.status-pill {
    display: inline-block;
    padding: 5px 9px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
}

.needs-improvement {
    background: #fff1e7;
    color: #a54b12;
}

.target-met {
    background: #eaf7f0;
    color: #18784b;
}

.recommendation {
    margin-top: 22px;
    padding: 18px;
    border-radius: 12px;
    background: #f5f7fc;
}

.recommendation h4 {
    margin: 0 0 10px;
}

.recommendation p {
    margin: 0 0 10px;
    line-height: 1.7;
}

.recommendation small {
    color: #68748a;
    line-height: 1.6;
}

@media (max-width: 600px) {
    .data-card {
        overflow-x: auto;
    }

    table {
        min-width: 420px;
    }
}



html {
    scroll-behavior: smooth;
    scroll-padding-top: 100px;
}

.brand {
    color: inherit;
    text-decoration: none;
    flex-shrink: 0;
}

.main-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
}

.main-nav a {
    color: #45516a;
    text-decoration: none;
    font-size: 13px;
    font-weight: 650;
    transition: color 0.2s ease;
}

.main-nav a:hover {
    color: #526ac1;
}

#home,
#student-dashboard,
#teacher-dashboard,
#security {
    scroll-margin-top: 100px;
}

@media (max-width: 850px) {
    .topbar {
        flex-wrap: wrap;
        justify-content: center;
    }

    .main-nav {
        order: 3;
        width: 100%;
        flex-wrap: wrap;
        gap: 18px;
    }
}

@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto;
    }
}


.hero-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 26px;
}

.hero-actions button {
    margin-top: 0;
    padding: 0 22px;
}

.hero-actions .secondary-button {
    background: #ffffff;
    color: #283e84;
    border: 1px solid #cbd4ed;
}

.hero-actions .secondary-button:hover {
    background: #edf1fc;
}

#access-form {
    scroll-margin-top: 100px;
}

@media (max-width: 480px) {
    .hero-actions {
        flex-direction: column;
    }

    .hero-actions button {
        width: 100%;
    }
}


.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin: 20px 0 26px;
}

.summary-card {
    padding: 22px;
    background: #ffffff;
    border: 1px solid #e6eaf2;
    border-radius: 15px;
    box-shadow: 0 8px 24px rgb(30 45 80 / 4%);
}

.summary-card p {
    margin: 0;
    color: #68748a;
    font-size: 13px;
    font-weight: 650;
}

.summary-card h3 {
    margin: 12px 0 8px;
    color: #283e84;
    font-size: 30px;
    letter-spacing: -0.7px;
}

.summary-card span {
    color: #748098;
    font-size: 12px;
    line-height: 1.6;
}

@media (max-width: 600px) {
    .summary-grid {
        grid-template-columns: 1fr;
    }
}

</style>

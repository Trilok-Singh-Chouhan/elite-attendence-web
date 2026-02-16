import { createClient } from 
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://btxhonrasfkughfvjgfa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eGhvbnJhc2ZrdWdoZnZqZ2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNDQ4NTcsImV4cCI6MjA4NjgyMDg1N30.CNuK7o9JDUXB239YbEvCswtYRPO7t7eY-m-eBSVRbZI'
)

let currentUser = null
let isLoginMode = true

/* ================= AUTH ================= */

window.toggleAuthMode = function() {
  isLoginMode = !isLoginMode
  document.getElementById('username').value = ""
  document.getElementById('password').value = ""
  document.getElementById('mainHeading').innerText = isLoginMode ? "ELITE" : "REGISTER"
  document.getElementById('authBtn').innerText = isLoginMode ? "Enter Portal" : "Sign Up"
  document.getElementById('toggleText').innerText = isLoginMode ? "New Faculty? Register" : "Have an account? Login"
}

window.handleAuth = async function() {
  const u = document.getElementById('username').value.trim()
  const p = document.getElementById('password').value.trim()

  if (!u || !p) return alert("Fill all fields")

  if (isLoginMode) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: u,
      password: p
    })
    if (error) return alert(error.message)
    window.location.href = "dashboard.html"
  } else {
    const { data, error } = await supabase.auth.signUp({
      email: u,
      password: p
    })
    if (error) return alert(error.message)

    await supabase.from("profiles").insert([{
      id: data.user.id,
      username: u,
      role: "faculty"
    }])

    alert("Account Created! Please Login.")
    toggleAuthMode()
  }
}

window.logout = async function() {
  await supabase.auth.signOut()
  window.location.href = "index.html"
}

/* ================= CHECK SESSION ================= */

async function checkUser() {
  const { data } = await supabase.auth.getUser()
  currentUser = data.user

  if (!currentUser && !window.location.pathname.includes("index.html")) {
    window.location.href = "index.html"
  }
}
await checkUser()

/* ================= DASHBOARD ================= */

if (window.location.pathname.includes("dashboard.html")) {
  loadDashboard()
}

async function loadDashboard() {
  document.getElementById('teacherHeader').innerHTML =
    `<p style="color:var(--primary); font-size:0.7rem">AUTHORIZED FACULTY</p>
     <p style="font-weight:bold; font-size:1.1rem">${currentUser.email}</p>`

  const { data } = await supabase
    .from("classes")
    .select("*")
    .eq("faculty_id", currentUser.id)

  renderClasses(data)
}

function renderClasses(classes) {
  document.getElementById('classList').innerHTML =
    classes.map(c => `
      <div class="card"
           onclick="window.location.href='attendance.html?class=${c.id}&name=${encodeURIComponent(c.class_name)}'"
           style="cursor:pointer">
        <h3 class="neon-text">${c.class_name}</h3>
        <p style="font-size:0.7rem; margin-top:15px; color:var(--text-dim)">
          OPEN RECORDS →
        </p>
      </div>`).join('')
}

window.createClass = async function() {
  const c = document.getElementById('className')
  if (!c.value) return

  await supabase.from("classes").insert([{
    faculty_id: currentUser.id,
    class_name: c.value
  }])

  c.value = ""
  loadDashboard()
}

/* ================= ATTENDANCE PAGE ================= */

const urlParams = new URLSearchParams(window.location.search)
const currentClassId = urlParams.get('class')
const currentClassName = urlParams.get('name')

if (currentClassId) loadAttendancePage()

async function loadAttendancePage() {

  document.getElementById('currentClassName').innerText = currentClassName

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", currentClassId)

  renderAttendanceList(students)
  renderRecords(students)
}

window.addStudent = async function() {
  const r = document.getElementById('rollNo')
  const n = document.getElementById('studentName')

  if (!r.value || !n.value) return

  await supabase.from("students").insert([{
    class_id: currentClassId,
    roll: r.value,
    name: n.value
  }])

  r.value = ""
  n.value = ""
  loadAttendancePage()
}

function renderAttendanceList(students) {
  const div = document.getElementById('attendanceList')
  if (!div) return

  document.getElementById('saveAttendanceBtn').style.display = 'block'

  div.innerHTML = students.map((s, i) => `
    <div class="student-row">
      <div style="flex:1">
        <b>${s.name}</b><br>
        <small style="color:var(--primary)">ID: ${s.roll}</small>
      </div>
      <div class="radio-toggle">
        <label>
          <input type="radio" name="st-${i}" value="Present" checked>
          <span>P</span>
        </label>
        <label>
          <input type="radio" name="st-${i}" value="Absent">
          <span>A</span>
        </label>
      </div>
      <input type="text" id="rem-${i}" placeholder="Add remark..."
             style="flex:1; margin-left:10px; font-size:0.75rem;">
    </div>
  `).join('')
}

window.saveAttendance = async function() {

  const d = document.getElementById('attendanceDate').value
  if (!d) return alert("Select Date")

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", currentClassId)

  for (let i = 0; i < students.length; i++) {
    const status =
      document.querySelector(`input[name="st-${i}"]:checked`).value
    const remark =
      document.getElementById(`rem-${i}`).value.trim()

    await supabase.from("attendance").insert([{
      student_id: students[i].id,
      date: d,
      status: status,
      remark: remark
    }])
  }

  alert("Attendance Saved Successfully")
  loadAttendancePage()
}

async function renderRecords(students) {

  const { data: attRecords } = await supabase
    .from("attendance")
    .select("*")

  const body = document.getElementById('recordsBody')
  body.innerHTML = ""

  students.forEach(s => {

    const personal = attRecords.filter(a => a.student_id === s.id)
    const p = personal.filter(a => a.status === "Present").length
    const total = personal.length
    const pct = total > 0 ? Math.round((p/total)*100) : 0

    body.innerHTML += `
      <tr>
        <td><b>${s.name}</b></td>
        <td>${p}/${total}</td>
        <td style="color:${pct < 75 ? 'var(--accent)' : 'var(--success)'}; font-weight:bold">
          ${pct}%
        </td>
        <td>-</td>
      </tr>`
  })
}

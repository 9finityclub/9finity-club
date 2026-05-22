
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Users, ShieldCheck, CreditCard, Download, Search } from "lucide-react";

const BASE_COUNT = 1287;
const ADMIN_PASSWORD = "9finityadmin";

const styles = {
  page: { minHeight: "100vh", background: "radial-gradient(circle at top,#221600,#000 42%)", color: "#fff4c2", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 7%", borderBottom: "1px solid rgba(212,175,55,.25)", position: "sticky", top: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(16px)", zIndex: 5 },
  logo: { fontWeight: 900, letterSpacing: "4px", color: "#d4af37" },
  nav: { display: "flex", gap: 10 },
  btn: { border: "0", borderRadius: 999, padding: "13px 24px", background: "linear-gradient(90deg,#fff2a8,#d4af37,#9b6b16)", color: "#000", fontWeight: 900, cursor: "pointer" },
  ghost: { border: "1px solid rgba(212,175,55,.4)", borderRadius: 999, padding: "12px 22px", background: "rgba(0,0,0,.25)", color: "#fff2a8", fontWeight: 800, cursor: "pointer" },
  card: { border: "1px solid rgba(212,175,55,.32)", background: "rgba(0,0,0,.62)", borderRadius: 32, padding: 28, boxShadow: "0 30px 80px rgba(0,0,0,.6)" },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid rgba(212,175,55,.28)", background: "#090603", color: "#fff4c2", borderRadius: 18, padding: "14px 15px", outline: "none" },
  label: { display: "block", color: "#f6df8f", fontWeight: 800, fontSize: 13, marginBottom: 8 },
};

function makeMemberId(name, count) {
  const part = (name || "NEW").trim().slice(0, 3).toUpperCase() || "NEW";
  return `9F-${part}-${String(count + 1).padStart(5, "0")}`;
}

function escapeCsv(v) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

function buildCSV(members) {
  const headers = ["Member ID","Full Name","Email","Phone","DOB","Address","Occupation","Plan","Payment Status","Join Date","Expiry Date"];
  const rows = members.map(m => [m.memberId,m.fullName,m.email,m.phone,m.dob,m.address,m.occupation,m.plan,m.paymentStatus,m.joinDate,m.expiryDate]);
  return [headers, ...rows].map(row => row.map(escapeCsv).join(",")).join("\n");
}

console.assert(makeMemberId("Kumar", 1287).startsWith("9F-KUM-"), "member id test");
console.assert(buildCSV([{fullName:'A "B"'}]).includes('A ""B""'), "csv quote test");

export default function App() {
  const [screen, setScreen] = useState("home");
  const [members, setMembers] = useState([]);
  const [photo, setPhoto] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", address: "", dob: "", occupation: "", password: "",
    plan: "₹9 Monthly Base Plan", paymentStatus: "Pending Razorpay"
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ninefinity_members") || "[]");
    setMembers(Array.isArray(saved) ? saved : []);
  }, []);

  const memberCount = BASE_COUNT + members.length;
  const memberId = useMemo(() => makeMemberId(form.fullName, memberCount), [form.fullName, memberCount]);

  const setField = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const saveMember = () => {
    if (!form.fullName || !form.phone || !form.email) {
      alert("Please enter Full Name, Email and Phone Number");
      return;
    }
    const member = {
      ...form,
      memberId,
      photo,
      joinDate: new Date().toLocaleDateString("en-IN"),
      expiryDate: "Pending Payment",
      createdAt: new Date().toISOString()
    };
    const updated = [...members, member];
    localStorage.setItem("ninefinity_members", JSON.stringify(updated));
    setMembers(updated);
    setScreen("profile");
  };

  const approve = id => {
    const updated = members.map(m => m.memberId === id ? {
      ...m,
      paymentStatus: "Active",
      expiryDate: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString("en-IN")
    } : m);
    localStorage.setItem("ninefinity_members", JSON.stringify(updated));
    setMembers(updated);
  };

  const remove = id => {
    const updated = members.filter(m => m.memberId !== id);
    localStorage.setItem("ninefinity_members", JSON.stringify(updated));
    setMembers(updated);
  };

  const exportCSV = () => {
    const blob = new Blob([buildCSV(members)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "9finity-members.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = members.filter(m => [m.memberId, m.fullName, m.email, m.phone].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>9FINITY CLUB</div>
        <div style={styles.nav}>
          <button style={styles.ghost} onClick={() => setScreen("admin")}>Admin</button>
          <button style={styles.btn} onClick={() => setScreen("join")}>Join ₹9</button>
        </div>
      </header>

      {screen === "home" && (
        <main style={{ padding: "70px 7%" }}>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{ ...styles.card, textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
            <h1 style={{ fontSize: 64, margin: 0, color: "#d4af37", letterSpacing: 3 }}>9FINITY CLUB</h1>
            <p style={{ fontSize: 22, color: "#f5dc8a" }}>Luxury ₹9 Membership Community</p>
            <p style={{ maxWidth: 760, margin: "25px auto", lineHeight: 1.8, color: "#d9c991" }}>
              9FINITY CLUB is a people-powered premium community. Members create a digital ID, join the ₹9 base plan, and access future rewards, events, announcements and community benefits.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={styles.btn} onClick={() => setScreen("join")}>Create Member ID</button>
              <button style={styles.ghost} onClick={() => setScreen("admin")}>Admin Dashboard</button>
            </div>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginTop: 30 }}>
            <Stat icon={<Users />} title="Live Club Members" value={memberCount.toLocaleString("en-IN")} />
            <Stat icon={<ShieldCheck />} title="Promise" value="No guaranteed returns" />
            <Stat icon={<CreditCard />} title="Payment" value="Razorpay Pending" />
          </div>
        </main>
      )}

      {screen === "join" && (
        <main style={{ padding: "40px 7%", display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(300px,.9fr)", gap: 24 }}>
          <section style={styles.card}>
            <h2 style={{ color: "#d4af37", marginTop: 0 }}>Create Your Member ID</h2>
            <p style={{ color: "#d9c991" }}>Fill details. Payment will be connected after Razorpay approval.</p>
            <div style={{ display: "grid", gap: 14 }}>
              <Input label="Full Name" name="fullName" value={form.fullName} onChange={setField} />
              <Input label="Email ID" name="email" value={form.email} onChange={setField} />
              <Input label="Phone Number" name="phone" value={form.phone} onChange={setField} />
              <Input label="Full Address" name="address" value={form.address} onChange={setField} />
              <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={setField} />
              <Input label="What do you do full-time?" name="occupation" value={form.occupation} onChange={setField} />
              <Input label="Create Password" name="password" type="password" value={form.password} onChange={setField} />
              <label>
                <span style={styles.label}><Camera size={15}/> Profile Photo</span>
                <input type="file" accept="image/*" onChange={handlePhoto} style={styles.input} />
              </label>
              <button style={styles.btn} onClick={saveMember}>Save Profile as Pending Member</button>
            </div>
          </section>
          <MemberCard form={form} memberId={memberId} photo={photo} />
        </main>
      )}

      {screen === "profile" && (
        <main style={{ padding: "50px 7%", display: "grid", gridTemplateColumns: "minmax(300px,.9fr) minmax(0,1fr)", gap: 24 }}>
          <MemberCard form={form} memberId={memberId} photo={photo} />
          <section style={styles.card}>
            <h2 style={{ color: "#d4af37" }}>Welcome, {form.fullName}</h2>
            <p style={{ color: "#d9c991" }}>Your profile is saved as pending. Admin can approve after Razorpay/payment integration.</p>
            <button style={styles.btn} onClick={() => setScreen("admin")}>Go to Admin Dashboard</button>
          </section>
        </main>
      )}

      {screen === "admin" && (
        <main style={{ padding: "40px 7%" }}>
          {!adminOpen ? (
            <section style={{ ...styles.card, maxWidth: 440, margin: "0 auto" }}>
              <h2 style={{ color: "#d4af37" }}>Admin Access</h2>
              <Input label="Admin Password" type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
              <button style={{ ...styles.btn, width: "100%", marginTop: 14 }} onClick={() => adminPass === ADMIN_PASSWORD ? setAdminOpen(true) : alert("Wrong password")}>Open Dashboard</button>
              <p style={{ color: "#9c8b55", fontSize: 12 }}>Demo password: 9finityadmin</p>
            </section>
          ) : (
            <section style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 15, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ color: "#d4af37", margin: 0 }}>Admin Monitoring Dashboard</h2>
                  <p style={{ color: "#d9c991" }}>Members database, approval controls and CSV export.</p>
                </div>
                <button style={styles.btn} onClick={exportCSV}><Download size={16}/> Export CSV</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 15, margin: "20px 0" }}>
                <Stat title="Total Members" value={members.length} />
                <Stat title="Active" value={members.filter(m => m.paymentStatus === "Active").length} />
                <Stat title="Pending" value={members.filter(m => m.paymentStatus !== "Active").length} />
                <Stat title="₹9 Active Value" value={`₹${members.filter(m => m.paymentStatus === "Active").length * 9}`} />
              </div>

              <label>
                <span style={styles.label}><Search size={15}/> Search</span>
                <input style={styles.input} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, email, ID" />
              </label>

              <div style={{ overflowX: "auto", marginTop: 20 }}>
                <table style={{ width: "100%", minWidth: 1050, borderCollapse: "collapse", color: "#f5dc8a" }}>
                  <thead><tr>{["Photo","Member ID","Name","Email","Phone","DOB","Occupation","Plan","Status","Join","Expiry","Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.length === 0 ? <tr><td colSpan="12" style={{ padding: 20, textAlign: "center" }}>No members found</td></tr> :
                      filtered.map(m => (
                        <tr key={m.memberId}>
                          <td style={td}>{m.photo ? <img src={m.photo} style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover" }} /> : "9F"}</td>
                          <td style={td}>{m.memberId}</td><td style={td}>{m.fullName}</td><td style={td}>{m.email}</td><td style={td}>{m.phone}</td>
                          <td style={td}>{m.dob}</td><td style={td}>{m.occupation}</td><td style={td}>{m.plan}</td><td style={td}>{m.paymentStatus}</td>
                          <td style={td}>{m.joinDate}</td><td style={td}>{m.expiryDate}</td>
                          <td style={td}>
                            <button style={miniBtn} onClick={() => approve(m.memberId)}>Approve</button>
                            <button style={miniGhost} onClick={() => remove(m.memberId)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
  return <label><span style={styles.label}>{label}</span><input {...props} style={styles.input} /></label>
}

function Stat({ icon, title, value }) {
  return <div style={styles.card}><div style={{ color: "#d4af37" }}>{icon}</div><p style={{ color: "#d9c991", marginBottom: 4 }}>{title}</p><h3 style={{ color: "#f6df8f", margin: 0, fontSize: 26 }}>{value}</h3></div>
}

function MemberCard({ form, memberId, photo }) {
  return (
    <section style={styles.card}>
      <h2 style={{ color: "#d4af37", letterSpacing: 3 }}>9FINITY CLUB</h2>
      <p style={{ color: "#d9c991" }}>Digital Member ID</p>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 20 }}>
        <div style={{ width: 96, height: 96, borderRadius: 24, border: "1px solid rgba(212,175,55,.35)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {photo ? <img src={photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Camera color="#d4af37" />}
        </div>
        <div>
          <h2 style={{ margin: 0 }}>{form.fullName || "Member Name"}</h2>
          <p style={{ color: "#d9c991" }}>{form.occupation || "Occupation"}</p>
          <b style={{ color: "#d4af37" }}>{memberId}</b>
        </div>
      </div>
      <div style={{ marginTop: 20, lineHeight: 1.9, color: "#d9c991" }}>
        <p><b>Email:</b> {form.email || "Not added"}</p>
        <p><b>Phone:</b> {form.phone || "Not added"}</p>
        <p><b>DOB:</b> {form.dob || "Not added"}</p>
        <p><b>Address:</b> {form.address || "Not added"}</p>
        <p><b>Status:</b> Pending Razorpay</p>
      </div>
    </section>
  );
}

const th = { padding: 12, borderBottom: "1px solid rgba(212,175,55,.3)", textAlign: "left", color: "#d4af37" };
const td = { padding: 12, borderBottom: "1px solid rgba(212,175,55,.15)", color: "#f4e5ac" };
const miniBtn = { ...styles.btn, padding: "8px 12px", marginRight: 6, fontSize: 12 };
const miniGhost = { ...styles.ghost, padding: "8px 12px", fontSize: 12 };

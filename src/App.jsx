
import React from 'react'

export default function App() {
  return (
    <div style={{
      minHeight:'100vh',
      background:'black',
      color:'#D4AF37',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      flexDirection:'column',
      fontFamily:'Arial'
    }}>
      <h1 style={{fontSize:'56px'}}>9FINITY CLUB</h1>
      <p>Luxury ₹9 Membership Community</p>
      <button style={{
        marginTop:'20px',
        padding:'14px 28px',
        borderRadius:'40px',
        border:'none',
        background:'#D4AF37',
        color:'black',
        fontWeight:'bold',
        cursor:'pointer'
      }}>
        Join Now
      </button>
    </div>
  )
}

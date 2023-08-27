import React from 'react';
import './index.css';
import VerificationInput from "react-verification-input";

function LoginA2F() {
    localStorage.setItem("connected", "no");
    const handleVerificationCode = (code) => {
        const URL = "http://" + window.location.hostname + ":4000";
        const final = URL + "/auth/log-a2f";
        fetch(final, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({ otp: code }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.data) {
                    console.log(data);
                    localStorage.setItem("connected", "yes");
                    const URL = "http://" + window.location.hostname + ":4000";
                    const final = URL + "/home";
                    window.location.href = final;
                    return;
                } else {
                    localStorage.setItem("connected", "no");
                }
            })
    };

    return (
        <div>
            <div className="verifinput">
                <VerificationInput length={6} validChars="0-9" onComplete={handleVerificationCode} />
            </div>
        </div>
    );
}

export default LoginA2F;

export const Logo = ({ className = "w-9 h-9" }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-label="Logotipo Quinta Matucana">
        <circle cx="24" cy="24" r="22" stroke="#14213D" strokeWidth="2.5" />
        {/* Pavilion arch */}
        <path d="M12 34 C12 20 18 13 24 13 C30 13 36 20 36 34" stroke="#0077B6" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Columns */}
        <line x1="17" y1="27" x2="17" y2="34" stroke="#0077B6" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="24" y1="22" x2="24" y2="34" stroke="#0077B6" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="31" y1="27" x2="31" y2="34" stroke="#0077B6" strokeWidth="2.4" strokeLinecap="round" />
        {/* Sun */}
        <circle cx="24" cy="9.5" r="3" fill="#F77F00" />
        {/* Rails */}
        <path d="M13 38.5 L35 38.5" stroke="#D62828" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M16 42 L32 42" stroke="#D62828" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
    </svg>
);

export const LogoMark = ({ className = "w-7 h-7" }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" />
        <path d="M12 34 C12 20 18 13 24 13 C30 13 36 20 36 34" stroke="#F77F00" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="24" cy="24" r="5" fill="#0077B6" />
    </svg>
);

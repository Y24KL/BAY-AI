import { NOTIFY_PHONE, GROUP_LINK } from "../data/formOptions";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="script">Be Part of A Smarter Bayelsa</div>
        <div className="foot-sq" />
        <a className="wa" href={`https://wa.me/${NOTIFY_PHONE}`} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.5M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2m0 18.2c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2" /></svg>
          +234 815 209 3040
        </a>
        <div style={{ margin: "-6px 0 22px" }}>
          <a href={GROUP_LINK} target="_blank" rel="noopener noreferrer" style={{ color: "#9FD4B0", fontWeight: 700, fontSize: "14.5px", textDecoration: "underline" }}>
            Join the participants group on WhatsApp
          </a>
        </div>
        <p>Powered by Lightfounders AI School Lagos</p>
        <p>People · Ideas · Skills · A Brighter Africa</p>
      </div>
    </footer>
  );
}

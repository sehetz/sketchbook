import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <a href="/" className="header__link text-3 hover-bold">
        Sketchbook
      </a>
      <a href="/about" className="header__link text-3 hover-bold">
        who dis?
      </a>
    </header>
  );
}

export default function DrawerBackdrop() {
  return (
    <div className="bs-drawer-backdrop" aria-hidden="true">
      <div className="bs-drawer-backdrop__top"><i>☰</i></div>
      <article><div className="bs-drawer-backdrop__hero"><b>Добро пожаловать<br />в учебный портал</b><span>Открывайте материалы<br />гибко и удобно</span><button /></div></article>
      <div className="bs-drawer-backdrop__target">◎</div>
      <span className="bs-drawer-backdrop__caption">Фокус месяца</span>
      <div className="bs-drawer-backdrop__card" />
    </div>
  )
}

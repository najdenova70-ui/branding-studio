import { resolveAsset } from '../brand/AssetResolver'
import { useBrand } from '../brand/BrandContext'
import chevronDark from '../assets/web-authorization/chevron-dark.svg'
import chevronLight from '../assets/web-authorization/chevron-light.svg'
import flagRu from '../assets/web-authorization/flag-ru.svg'
import headerLogoMark from '../assets/web-authorization/header-logo-mark.svg'
import headerLogoWordmark from '../assets/web-authorization/header-logo-wordmark.svg'
import supportIcon from '../assets/web-authorization/support.svg'

export default function WebAuthorization() {
  const { config } = useBrand()
  const background = resolveAsset(config.assets.web.authorization.background)
  const logo = resolveAsset(config.assets.web.authorization.logo)

  return (
    <div className="bs-web-auth" data-figma-node="8470:8952">
      <header className="bs-web-auth__header" data-figma-node="8470:8955">
        <div className="bs-web-auth__header-logo" data-figma-node="8470:9111">
          <img src={headerLogoMark} alt="" /><img src={headerLogoWordmark} alt="Эквио" />
        </div>
      </header>

      <main className="bs-web-auth__chooser" data-figma-node="8470:8954">
        <section className="bs-web-auth__card">
          <h1>Вход на платформу<br />создателей Эквио</h1>
          <div className="bs-web-auth__methods">
            <div className="bs-web-auth__method is-primary">
              <span><strong>Вход по логину и паролю</strong><small>Для входа потребуется ввести табельный номер</small></span>
              <img src={chevronLight} alt="" />
            </div>
            <div className="bs-web-auth__method">
              <span><strong>Вход по СМС</strong><small>Для входа потребуется ввести номер телефона, после чего, Вам придет SMS с кодом доступа</small></span>
              <img src={chevronDark} alt="" />
            </div>
            <div className="bs-web-auth__method">
              <span><strong>Вход через сторонние сервисы</strong><small>Для входа выберите способ авторизации</small></span>
              <img src={chevronDark} alt="" />
            </div>
          </div>
        </section>
        <div className="bs-web-auth__signup"><span>Еще нет аккаунта?</span><strong>Регистрация</strong></div>
      </main>

      <div className="bs-web-auth__bottom" data-figma-node="8470:9010">
        <div className="bs-web-auth__language"><img src={flagRu} alt="" /><strong>RU</strong></div>
        <div className="bs-web-auth__support"><img src={supportIcon} alt="" /><strong>Служба поддержки</strong></div>
      </div>

      <div className="bs-web-auth__brand" data-figma-node="8470:9014">
        <img className="bs-web-auth__background" src={background.src} style={background.style} alt="" data-figma-node={background.figmaNodeId} />
        <div className="bs-web-auth__logo-mask" />
        <img className="bs-web-auth__logo" src={logo.src} alt="" data-figma-node={logo.figmaNodeId} />
      </div>
    </div>
  )
}

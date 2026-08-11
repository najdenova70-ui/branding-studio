/**
 * Login — Figma `iPhone - 27` 3098:54518.
 * Brandable: brand.primary (CTA fill, checkbox), brand.onPrimary (CTA label).
 * Figma binds the CTA to variable `secondary` (#334057); normalized to
 * brand.primary by TokenResolver.
 */
import { useBrand } from '../brand/BrandContext'
import { FIXED } from '../brand/TokenResolver'
import { StatusBar, HomeIndicator, ChevronLeft } from './chrome'
import type { ScreenProps } from '../registry/types'

function Field({ label, value, dots = false }: { label: string; value: string; dots?: boolean }) {
  return (
    <div style={{ position: 'relative', width: 375, height: 77 }}>
      <div style={{ position: 'absolute', left: 16, top: 12, fontSize: 12, lineHeight: '16px', color: FIXED.textMedium }}>
        {label}
      </div>
      <div style={{
        position: 'absolute', left: 16, top: 32, fontSize: 17, lineHeight: '22px',
        letterSpacing: -0.408, color: FIXED.textHigh,
        ...(dots ? { letterSpacing: 2, fontSize: 15 } : {}),
      }}>
        {value}
      </div>
      {dots && (
        <div style={{
          position: 'absolute', right: 16, top: 34, width: 18, height: 18,
          borderRadius: '50%', border: `1.5px solid ${FIXED.stub}`,
        }} />
      )}
      <div style={{ position: 'absolute', left: 16, top: 76, width: 343, height: 1, background: FIXED.divider }} />
    </div>
  )
}

export default function Login({ onNavigate }: ScreenProps) {
  const { config } = useBrand()

  return (
    <div style={{ position: 'absolute', inset: 0, background: FIXED.surface }}>
      <StatusBar />
      <button onClick={() => onNavigate?.('splash')} aria-label="Назад" style={{
        position: 'absolute', left: 16, top: 60, width: 24, height: 20,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      }}>
        <ChevronLeft />
      </button>

      {/* Frame 1247 at y=112 */}
      <div style={{ position: 'absolute', top: 112, left: 0, width: 375 }}>
        <div style={{
          padding: '0 16px', fontSize: 24, lineHeight: '28px', fontWeight: 600,
          letterSpacing: 0.352, color: FIXED.textHigh,
        }}>
          Вход в учебный портал
        </div>
        <div style={{
          margin: '12px 16px 0', width: 343, fontSize: 13, lineHeight: '18px',
          letterSpacing: -0.078, color: FIXED.textMedium,
        }}>
          Введите данные из приглашения или выберите этот вход для восстановления пароля
        </div>

        <div style={{ marginTop: 24 }}>
          <Field label="Логин" value="alex.stepanov" />
          <Field label="Пароль" value="••••••" dots />
        </div>

        {/* Group 1047 */}
        <div style={{ position: 'relative', width: 375, height: 44, marginTop: 12 }}>
          <div style={{
            position: 'absolute', left: 16, top: 0, width: 20.88, height: 20.88, borderRadius: 4,
            background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="9" viewBox="0 0 12 9" aria-hidden>
              <path d="M1 4.5 4.3 8 11 1" fill="none" stroke="var(--brand-on-primary)" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ position: 'absolute', left: 44.44, top: 0, fontSize: 15, lineHeight: '20px', letterSpacing: -0.24, color: FIXED.textHigh }}>
            Запомнить
          </div>
          <div style={{ position: 'absolute', right: 16, top: 1, fontSize: 15, lineHeight: '20px', letterSpacing: -0.24, color: FIXED.textHigh }}>
            Помощь со входом
          </div>
        </div>

        {/* Buttons / Button - Primary — 11:18484, 343x44, radius 12 */}
        <div style={{ marginTop: 32, padding: '0 16px' }}>
          <button
            onClick={() => onNavigate?.('profile')}
            style={{
              width: 343, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'var(--brand-primary)', color: 'var(--brand-on-primary)',
              fontSize: 15, lineHeight: '20px', letterSpacing: -0.24, fontFamily: 'inherit',
            }}
          >
            Войти по логину и паролю
          </button>
        </div>
      </div>

      {/* Group 1034 at y=746 — footer band + version label 0:329 at y=754 */}
      <div style={{ position: 'absolute', top: 746, left: 0, width: 375, height: 66, background: FIXED.surfaceGrey }}>
        <div style={{
          position: 'absolute', left: 130, top: 8, width: 114, textAlign: 'center',
          fontSize: 13, lineHeight: '16px', color: FIXED.textMedium,
        }}>
          v 5.8.0 (1) by <span style={{ textDecoration: 'underline' }}>ekvio</span>
        </div>
      </div>
      <HomeIndicator />
      <span hidden>{config.brandId}</span>
    </div>
  )
}

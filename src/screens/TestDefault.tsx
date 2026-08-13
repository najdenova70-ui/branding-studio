/**
 * Test — default state. Figma local frame `Frame` 5984:34313 (slide 05).
 * Carries the strongest colour evidence in the file: `primary`, `secondary`,
 * `inactive` and `additional` all resolve to #334057 on this one screen,
 * plus `Text on Primary / High Emphasis` #FFFFFF.
 * Slide 05 subtitle: "all active controls are painted in corporate colours".
 */
import { useState } from 'react'
import { FIXED } from '../brand/TokenResolver'
import { StatusBar, HomeIndicator } from './chrome'

const ANSWERS = ['Торговым сегментам', 'Торговым критериям', 'Вариант ответа', 'Вариант ответа']

export default function TestDefault() {
  const [selected, setSelected] = useState(0)

  return (
    <div style={{ position: 'absolute', inset: 0, background: FIXED.surface }}>
      {/* Toolbar / ios/iOS - Navbar + Status Bar — 5984:34314, 375x96 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 375, height: 96, background: FIXED.surface }}>
        <StatusBar />
        <div style={{ position: 'absolute', top: 44, left: 0, width: 375, height: 52 }}>
          <span style={{ position: 'absolute', left: 16, top: 16, fontSize: 20, lineHeight: '20px', color: FIXED.textHigh }}>✕</span>
          <div style={{
            position: 'absolute', left: 0, top: 15, width: 375, textAlign: 'center',
            fontSize: 17, lineHeight: '22px', fontWeight: 600, letterSpacing: -0.408, color: FIXED.textHigh,
          }}>
            Осталось: 29:38
          </div>
        </div>
      </div>

      {/* Helper - 02 — 5984:34315 at y=88.5, 375x56 */}
      <div style={{
        position: 'absolute', top: 96, left: 0, width: 375, height: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, lineHeight: '18px', letterSpacing: -0.078, color: FIXED.textMedium,
      }}>
        Выберите один ответ
      </div>

      {/* Frame 488 — 5984:34319 at (16, 169) 344x316 */}
      <div style={{ position: 'absolute', left: 16, top: 169, width: 344 }}>
        <div style={{ width: 344, fontSize: 15, lineHeight: '20px', letterSpacing: -0.24, color: FIXED.textHigh }}>
          1/7 Гипермаркеты, продуктовые магазины и киоски относятся к:
        </div>

        {/* Frame 489 at y=60 — four 58px rows, 8px gaps */}
        <div style={{ marginTop: 16, width: 343 }}>
          {ANSWERS.map((a, i) => {
            const on = i === selected
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  position: 'relative', display: 'block', width: 343, height: 58, marginBottom: 8,
                  borderRadius: 8, cursor: 'pointer', textAlign: 'left', background: FIXED.surface,
                  border: on ? '2px solid var(--c-additional)' : `1px solid ${FIXED.divider}`,
                  boxShadow: on ? 'inset 0 0 0 999px var(--c-inactive)' : 'none',
                  fontFamily: 'inherit', padding: 0,
                }}
              >
                <span style={{
                  position: 'absolute', left: on ? 15 : 16, top: on ? 18 : 19, width: 20, height: 20,
                  borderRadius: '50%',
                  border: on ? '2px solid var(--c-additional)' : `1.6px solid ${FIXED.stub}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--c-additional)' }} />}
                </span>
                <span style={{
                  position: 'absolute', left: on ? 47 : 48, top: on ? 18 : 19,
                  fontSize: 15, lineHeight: '20px', letterSpacing: -0.24, color: FIXED.textHigh,
                }}>
                  {a}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rectangle 517 (y=742) + Frame 490 (16, 744) 343x44 */}
      <div style={{ position: 'absolute', left: 0, top: 742, width: 375, height: 70, background: FIXED.surface }} />
      <button style={{
        position: 'absolute', left: 16, top: 744, width: 343, height: 44, borderRadius: 12, border: 'none',
        background: 'var(--c-secondary)', color: 'var(--c-authorizationTextHighEmphasis)', cursor: 'pointer',
        fontSize: 15, lineHeight: '20px', letterSpacing: -0.24, fontFamily: 'inherit',
      }}>
        Проверить
      </button>

      <HomeIndicator top={777} />
    </div>
  )
}

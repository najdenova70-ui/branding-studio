/**
 * ScreenRegistry — the one list of real screens. Both Presentation mode and
 * Prototype mode render from here, so a branded screen can never drift between
 * the two.
 */
import AppIconTile from '../screens/AppIconTile'
import AuthSplash from '../screens/AuthSplash'
import Login from '../screens/Login'
import Profile376 from '../screens/Profile376'
import NavigationDrawer from '../screens/NavigationDrawer'
import TestDefault from '../screens/TestDefault'
import HomeScreen from '../screens/HomeScreen'
import { MainBannerScreen, MainContentScreen } from '../screens/FigmaStaticScreen'
import type { ScreenEntry, ScreenId } from './types'

export const SCREENS: ScreenEntry[] = [
  {
    id: 'home', title: 'Рабочий стол телефона', figmaNodeId: '11:21468', figmaName: 'Home',
    width: 375, height: 812, brandFields: ['assets.appIcon'], component: HomeScreen,
  },
  {
    id: 'splash',
    title: 'Авторизация — заставка',
    figmaNodeId: '3098:54515',
    figmaName: 'iPhone - 25',
    width: 375, height: 812,
    brandFields: ['assets.background.authPhone', 'assets.logo.largeWhiteRu', 'colors.authorizationTextMediumEmphasis', 'colors.progressBar', 'colors.progressBarBackground'],
    component: AuthSplash,
  },
  {
    id: 'login',
    title: 'Вход в учебный портал',
    figmaNodeId: '3098:54518',
    figmaName: 'iPhone - 27',
    width: 375, height: 812,
    brandFields: ['colors.additional', 'colors.authorizationButton', 'colors.authorizationButtonText'],
    component: Login,
  },
  {
    id: 'profile',
    title: 'Профиль',
    figmaNodeId: '6135:62217',
    figmaName: '376',
    width: 375, height: 812,
    brandFields: ['colors.primary', 'colors.authorizationTextHighEmphasis'],
    component: Profile376,
  },
  {
    id: 'drawer',
    title: 'Боковое меню',
    figmaNodeId: '6135:23134',
    figmaName: 'Navigation Drawer iOS',
    width: 375, height: 812,
    brandFields: ['assets.background.navigationDrawer'],
    component: NavigationDrawer,
  },
  {
    id: 'mainBanner', title: 'Главная — баннер', figmaNodeId: '6137:110093', figmaName: '1027',
    width: 375, height: 812, brandFields: ['assets.background.mainBanner'], component: MainBannerScreen,
  },
  {
    id: 'mainContent', title: 'Главная — содержимое', figmaNodeId: '6135:32247', figmaName: '1026',
    width: 375, height: 812, brandFields: [], component: MainContentScreen,
  },
  {
    id: 'test',
    title: 'Тестирование',
    figmaNodeId: '5984:34313',
    figmaName: 'Frame (slide 05)',
    width: 375, height: 812,
    brandFields: ['colors.additional', 'colors.inactive', 'colors.secondary', 'colors.authorizationTextHighEmphasis'],
    component: TestDefault,
  },
  {
    id: 'appIconTile',
    title: 'Иконка приложения',
    figmaNodeId: null,
    figmaName: 'Studio preview — asset 11:20376',
    width: 375, height: 812,
    brandFields: ['assets.appIcon'],
    component: AppIconTile,
  },
]

export function getScreen(id: ScreenId): ScreenEntry {
  const s = SCREENS.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown screen: ${id}`)
  return s
}

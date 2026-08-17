import { Header } from './Header'
import { BreadCrumbs } from './BreadCrumbs'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Footer } from './Footer'
import '../../../App.css'

export const PageWrapper = () => {
  return (
    <div className="site-layout">
      <Header />
      <BreadCrumbs />
      <ScrollRestoration/>
      <Outlet />
      <Footer />
    </div>
  )
}

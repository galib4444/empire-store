import { brand } from "@lib/brand"
import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to your ${brand.name} account.`,
}

export default function Login() {
  return <LoginTemplate />
}

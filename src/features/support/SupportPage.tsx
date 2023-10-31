import Script from 'next/script'
import { Container } from '@/components/layout/Container'

export const SupportPage: React.FC = () => {
  return (
    <Container>
      <Script src="https://sdk.form.run/js/v2/embed.js" />
      <div
        className="formrun-embed"
        data-formrun-form="@gta-you-tube--8838"
        data-formrun-redirect="true"
      ></div>
    </Container>
  )
}

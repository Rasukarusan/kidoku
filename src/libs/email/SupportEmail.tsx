import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface Props {
  email?: string
}

export const SupportEmail = ({ email = 'example@exmaple.com' }: Props) => {
  return (
    <Html>
      <Head />
      <Preview>this is preview!</Preview>
      <Tailwind>
        <Body className="my-auto mx-auto bg-white font-sans">
          <Container className="my-[40px] mx-auto w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="my-[30px] mx-0 p-0 text-center text-[24px] font-normal text-black"></Heading>
            <Text className="text-[14px] leading-[24px] text-black"></Text>
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>bukinoshita</strong> (<strong>Vercel</strong>.
            </Text>
            <Section>
              <Row>
                <Column align="right"></Column>
                <Column align="center">email = {email}</Column>
                <Column align="left"></Column>
              </Row>
            </Section>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button className="rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline">
                Join the team
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:{' '}
            </Text>
            <Hr className="my-[26px] mx-0 w-full border border-solid border-[#eaeaea]" />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default SupportEmail

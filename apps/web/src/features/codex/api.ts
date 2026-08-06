import { gql } from '@apollo/client'

export const codexAuthStatusQuery = gql`
  query CodexAuthStatus {
    codexAuthStatus {
      connected
      accountId
      expiresAt
      expired
    }
  }
`

export const startCodexDeviceAuthMutation = gql`
  mutation StartCodexDeviceAuth {
    startCodexDeviceAuth {
      deviceAuthId
      userCode
      verificationUrl
      intervalSeconds
    }
  }
`

export const pollCodexDeviceAuthMutation = gql`
  mutation PollCodexDeviceAuth($input: PollCodexDeviceAuthInput!) {
    pollCodexDeviceAuth(input: $input) {
      status
      accountId
    }
  }
`

export const disconnectCodexAuthMutation = gql`
  mutation DisconnectCodexAuth {
    disconnectCodexAuth
  }
`

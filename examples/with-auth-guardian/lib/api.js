import { ONE_GRAPH_APP_ID } from '../lib/constants'
import { basicFetchOneGraph } from '../lib/oneGraphNextClient'

const ONE_GRAPH_SERVER_SIDE_ACCESS_TOKEN =
  process.env.ONE_GRAPH_SERVER_SIDE_ACCESS_TOKEN

const operationsDoc = `
query GitHubIssuesQuery(
  $first: Int = 50
  $name: String = "nextjs-auth-guardian-starterkit"
  $owner: String = "sgrove"
) {
  gitHub {
    repository(name: $name, owner: $owner) {
      issues(
        first: $first
        orderBy: { field: CREATED_AT, direction: DESC }
      ) {
        totalCount
        edges {
          node {
            ...GitHubIssueFragment
          }
        }
      }
    }
  }
}

query GitHubIssueQuery(
  $name: String = "nextjs-auth-guardian-starterkit"
  $owner: String = "sgrove"
  $number: Int = 10
) {
  gitHub {
    repository(name: $name, owner: $owner) {
      issue(number: $number) {
        ...GitHubIssueFragment
      }
    }
  }
}

fragment GitHubIssueFragment on GitHubIssue {
  title
  url
  body
  number 
  createdAt
  author {
    login
    avatarUrl
  }
  repository {
    openGraphImageUrl
  }
}

query FindMeOnGitHub {
  me {
    github {
      bio
      email
      databaseId
      id
      name
    }
  }
}
`

export async function getAllIssues(first, repoForIssues) {
  const repo = repoForIssues || {
    name: 'nextjs-auth-guardian-starterkit',
    owner: 'sgrove',
  }
  const result = await basicFetchOneGraph(
    ONE_GRAPH_APP_ID,
    ONE_GRAPH_SERVER_SIDE_ACCESS_TOKEN,
    operationsDoc,
    { owner: repo.owner, name: repo.name, first: first },
    'GitHubIssuesQuery'
  )

  const allIssues = result.data?.gitHub?.repository?.edges

  return allIssues || null
}

export async function getIssueWithAccessToken(
  accessToken,
  number,
  repoForIssue
) {
  const repo = repoForIssue || {
    name: 'nextjs-auth-guardian-starterkit',
    owner: 'sgrove',
  }
  const result = await basicFetchOneGraph(
    ONE_GRAPH_APP_ID,
    accessToken,
    operationsDoc,
    { owner: repo.owner, name: repo.name, number: number },
    'GitHubIssueQuery'
  )

  const issue = result.data?.gitHub?.repository?.issue

  return issue || null
}

export async function getIssueWithServerSideAccessToken(number, repoForIssue) {
  return getIssueWithAccessToken(
    ONE_GRAPH_SERVER_SIDE_ACCESS_TOKEN,
    number,
    repoForIssue
  )
}

export async function findMeOnGitHub(accessToken) {
  const result = await basicFetchOneGraph(
    ONE_GRAPH_APP_ID,
    accessToken,
    operationsDoc,
    {},
    'FindMeOnGitHub'
  )

  const me = result.data?.me?.github

  return me || null
}

# gh queries

`{owner}` and `{repo}` are filled in by `gh` from the current repository.

## Unresolved review threads

```bash
gh api graphql -F owner='{owner}' -F repo='{repo}' -F pr=<number> -f query='
query($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      reviewThreads(first: 100) {
        nodes {
          id isResolved isOutdated path line
          comments(first: 20) { nodes { author { login } body url } }
        }
      }
    }
  }
}' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved | not)'
```

## Reply to a thread

```bash
gh api graphql -F thread=<thread-id> -F body='Fixed in <sha>: <what changed>.' -f query='
mutation($thread: ID!, $body: String!) {
  addPullRequestReviewThreadReply(input: {pullRequestReviewThreadId: $thread, body: $body}) { comment { url } }
}'
```

## Resolve a thread (only with the user's OK)

```bash
gh api graphql -F thread=<thread-id> -f query='
mutation($thread: ID!) { resolveReviewThread(input: {threadId: $thread}) { thread { isResolved } } }'
```

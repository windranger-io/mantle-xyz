# Contributing to the BitDAO OS

This guide defines our development processes. Reading and understanding is essential and will help you stay consistent and will ensure your PRs get merged into production faster!

## We Use Continous Integration

The number 1 rule is to make your pull requests easy to review. To help this we use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary). Please read how to use this standard correctly!

Pull requests are opened directly to main where all the e2e tests and linting will run.

- Create feature branch send open draft pr to `main`
- Use the following standard and inlude the ticket id in the title. Format is lowercase except for some elements like components
  - feat(design-system): add Button, Card components [core-432]
  - fix(ui): show correct props
  - docs(dashboard): add comments to utility functions
  - Commits in the PR should also follow Conventional commit standards
- Include a summary in the pr and checklist if needed
- Request reviews from peers
- Request QA and regression testing on feature branch, ensure tests are passing
- Merge the feature branch to main with `squash & merge`
- Delete feature branch after merge

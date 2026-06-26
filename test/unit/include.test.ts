import { describe, expect, it } from 'vitest'
import { parseInclude } from '../../server/engine/include'

describe('parseInclude', () => {
  it('returns empty array for undefined input', () => {
    expect(parseInclude()).toEqual([])
  })

  it('parses a single relation', () => {
    expect(parseInclude('author')).toEqual([
      { relation: 'author', nested: [] }
    ])
  })

  it('parses nested relation', () => {
    expect(parseInclude('author.profile')).toEqual([
      { relation: 'author', nested: [{ relation: 'profile', nested: [] }] }
    ])
  })

  it('parses multiple relations', () => {
    expect(parseInclude('author,comments')).toEqual([
      { relation: 'author', nested: [] },
      { relation: 'comments', nested: [] }
    ])
  })

  it('parses mixed flat and nested', () => {
    expect(parseInclude('author.profile,comments')).toEqual([
      { relation: 'author', nested: [{ relation: 'profile', nested: [] }] },
      { relation: 'comments', nested: [] }
    ])
  })

  it('trims whitespace', () => {
    expect(parseInclude(' author , comments.likes ')).toEqual([
      { relation: 'author', nested: [] },
      { relation: 'comments', nested: [{ relation: 'likes', nested: [] }] }
    ])
  })
})

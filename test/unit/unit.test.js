const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const { expect } = Code;
const lab = exports.lab = Lab.script();

const PathMatcher = require('../../lib/utils/pathmatcher');

lab.experiment('Unit tests', () => {

    lab.experiment('PathMatcher', () => {

        lab.test('/posts/{id}/comments & /posts/23/comments should match', () => {
            const str1 = '/posts/{id}/comments';
            const str2 = '/posts/1/comments';
            const isMatch = PathMatcher.match(str1, str2);

            expect(isMatch).to.be.true();
        });

        lab.test('/posts/{id}/comments & /posts/1/author should not match', () => {
            const str1 = '/posts/{id}/comments';
            const str2 = '/posts/1/author';
            const isMatch = PathMatcher.match(str1, str2);

            expect(isMatch).to.be.false();
        });

        lab.test('/posts/{id}/comments & /author/25/posts/1/comments should not match', () => {
            const str1 = '/posts/{id}/comments';
            const str2 = '/author/25/posts/1/comments';
            const isMatch = PathMatcher.match(str1, str2);

            expect(isMatch).to.be.false();
        });
    });
});


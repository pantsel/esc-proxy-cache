const PathMatcher = require('../../lib/utils/pathmatcher');

module.exports = ({expect}, { experiment, test }) => {
    experiment('PathMatcher', () => {

        test('/posts/{id}/comments & /posts/23/comments should match', () => {
            const str1 = '/posts/{id}/comments';
            const str2 = '/posts/1/comments';
            const isMatch = PathMatcher.match(str1, str2);

            expect(isMatch).to.be.true();
        });

        test('/posts/{id}/comments & /posts/1/author should not match', () => {
            const str1 = '/posts/{id}/comments';
            const str2 = '/posts/1/author';
            const isMatch = PathMatcher.match(str1, str2);

            expect(isMatch).to.be.false();
        });

        test('/posts/{id}/comments & /author/25/posts/1/comments should not match', () => {
            const str1 = '/posts/{id}/comments';
            const str2 = '/author/25/posts/1/comments';
            const isMatch = PathMatcher.match(str1, str2);

            expect(isMatch).to.be.false();
        });
    });
};




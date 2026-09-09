import * as assert from "assert";
import { getChangedFiles } from "../core/git/changedFiles";

suite("Changed Files", () => {

    test("returns changed files between revisions", () => {

        const result = getChangedFiles(
            "HEAD~1",
            "HEAD"
        );

        assert.ok(Array.isArray(result));
    });

});
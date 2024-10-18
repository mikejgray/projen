import { MergeMethod } from "../../src/github/auto-queue";
import { NodeProject } from "../../src/javascript";
import { synthSnapshot, TestProject } from "../util";

describe("merge-queue", () => {
  test("auto queue workflow generated by default with merge queue enabled", async () => {
    const project = new TestProject({
      githubOptions: {
        mergeQueue: true,
      },
    });

    const snapshot = synthSnapshot(project);
    const autoQueue = snapshot[`.github/workflows/auto-queue.yml`];

    expect(autoQueue).toBeDefined();
    expect(autoQueue).toContain("enable-pull-request-automerge");
    expect(autoQueue).toContain("merge-method: squash");
    expect(autoQueue).toMatchSnapshot();
  });

  test("auto queue workflow not generated with merge queue disabled", async () => {
    const project = new TestProject({});

    const snapshot = synthSnapshot(project);
    const autoQueue = snapshot[`.github/workflows/auto-queue.yml`];

    expect(autoQueue).toBeUndefined();
  });

  test("auto queue workflow not generated if autoQueue is disabled", async () => {
    const project = new TestProject({
      githubOptions: {
        mergeQueue: true,
        mergeQueueOptions: {
          autoQueue: false,
        },
      },
    });

    const snapshot = synthSnapshot(project);
    const autoQueue = snapshot[`.github/workflows/auto-queue.yml`];

    expect(autoQueue).toBeUndefined();
  });

  test("auto queue workflow generated with custom options", async () => {
    const project = new TestProject({
      githubOptions: {
        mergeQueue: true,
        mergeQueueOptions: {
          autoQueueOptions: {
            allowedUsernames: ["foo"],
            labels: ["abc"],
            mergeMethod: MergeMethod.MERGE,
            runsOn: ["gpu"],
            secret: "shh",
          },
        },
      },
    });

    const snapshot = synthSnapshot(project);
    const autoQueue = snapshot[`.github/workflows/auto-queue.yml`];

    expect(autoQueue).toContain(
      "if: (contains(github.event.pull_request.labels.*.name, 'abc')) && (github.event.pull_request.user.login == 'foo')"
    );
    expect(autoQueue).toContain("merge-method: merge");
    expect(autoQueue).toContain("token: ${{ secrets.shh }}");
    expect(autoQueue).toContain("runs-on: gpu");
    expect(autoQueue).toMatchSnapshot();
  });

  test("auto queue workflow generated with target branches", async () => {
    const project = new NodeProject({
      buildWorkflow: true,
      defaultReleaseBranch: "asd",
      name: "adas",
      githubOptions: {
        mergeQueue: true,
        mergeQueueOptions: {
          targetBranches: ["feature-1", "feature-2"],
        },
      },
    });

    const snapshot = synthSnapshot(project);
    const autoQueue = snapshot[`.github/workflows/auto-queue.yml`];
    const build = snapshot[`.github/workflows/build.yml`];

    expect(autoQueue).toBeDefined();
    expect(build).toContain(`    branches:
      - feature-1
      - feature-2`);
  });
});

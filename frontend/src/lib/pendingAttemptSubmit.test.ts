import { describe, expect, it, vi } from "vitest";
import {
  beginPendingAttemptSubmit,
  clearPendingAttemptSubmit,
  clearStashedSubmitResult,
  peekPendingAttemptSubmit,
  takeStashedSubmitResult,
} from "./pendingAttemptSubmit";

describe("pendingAttemptSubmit", () => {
  it("allows multiple consumers on the same in-flight promise", async () => {
    clearPendingAttemptSubmit();
    clearStashedSubmitResult();

    let resolve!: (value: { attemptId: string; productSet: "SELF" }) => void;
    const promise = new Promise<{ attemptId: string; productSet: "SELF" }>((res) => {
      resolve = res;
    });

    beginPendingAttemptSubmit({ promise, productSet: "SELF" });
    expect(peekPendingAttemptSubmit()).not.toBeNull();

    const first = vi.fn();
    const second = vi.fn();
    void peekPendingAttemptSubmit()!.promise.then(first);
    void peekPendingAttemptSubmit()!.promise.then(second);

    resolve({ attemptId: "abc-123", productSet: "SELF" });
    await promise;

    expect(first).toHaveBeenCalledWith({ attemptId: "abc-123", productSet: "SELF" });
    expect(second).toHaveBeenCalledWith({ attemptId: "abc-123", productSet: "SELF" });
    expect(takeStashedSubmitResult()).toEqual({ attemptId: "abc-123", productSet: "SELF" });
  });
});

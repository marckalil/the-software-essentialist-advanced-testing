type ValidMethodName<T> = keyof T;

type Call<T> = {
  methodName: ValidMethodName<T>;
  args: any[];
  context?: any;
};

export abstract class Spy<T> {
  private calls: Call<T>[];
  constructor() {
    this.calls = [];
  }

  protected addCall(
    methodName: ValidMethodName<T>,
    args: any[],
    context?: any,
  ): void {
    const call: Call<T> = {
      methodName,
      args,
      context,
    };
    this.calls.push(call);
  }

  getTimesMethodCalled(methodName: ValidMethodName<T>): number {
    return this.calls.filter((call) => call.methodName === methodName).length;
  }

  protected resetSpiedCalls(): void {
    this.calls = [];
  }
}

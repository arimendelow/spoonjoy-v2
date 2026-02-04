import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  // Hook to execute before a story is initially visited
  async preVisit(page) {
    // Add any global setup here
  },
  // Hook to execute after a story is visited and fully rendered  
  async postVisit(page) {
    // Accessibility checks could go here
  },
};

export default config;

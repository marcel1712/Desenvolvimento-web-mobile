// Enable React act() for async state updates in tests
import "@testing-library/jest-native/extend-expect";

// Required for React 18+ concurrent mode in tests
(global as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

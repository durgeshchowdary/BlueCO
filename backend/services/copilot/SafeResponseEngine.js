export class SafeResponseEngine {
  static processResponse(response) {
    return {
      ...response,
      isHallucinationSafe: response.isHallucinationSafe !== false,
    };
  }
}

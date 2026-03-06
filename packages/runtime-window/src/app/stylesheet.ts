
export function createStyleSheet(rules: string): CSSStyleSheet {
    const sheet = new CSSStyleSheet;
    sheet.replaceSync(rules);
    return sheet;
}

export function varsToStyleSheet(vars: Record<string, string>) {
  const sheet = new CSSStyleSheet;
  const ruleIndex = sheet.insertRule('*, :host, :root {}');

  const style = (sheet.cssRules[ruleIndex]! as CSSStyleRule).style;

  for (const [k, v] of Object.entries(vars)) {
    style.setProperty(k, v);
  }

  return sheet;
}

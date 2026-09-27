function copyWithHiddenTextarea(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  return copied;
}

export async function copyText(text: string): Promise<boolean> {
  if (!window.isSecureContext || navigator.clipboard === undefined) {
    return copyWithHiddenTextarea(text);
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    if (error instanceof DOMException) {
      return copyWithHiddenTextarea(text);
    }
    throw error;
  }
}

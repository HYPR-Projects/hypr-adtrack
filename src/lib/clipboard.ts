/**
 * Copia texto para a área de transferência com fallback em 2 camadas.
 *
 * 1. Tenta a Clipboard API moderna (navigator.clipboard.writeText).
 *    Pode falhar silenciosamente em: iframes sem permission-policy,
 *    contextos inseguros (HTTP), Chrome com política corporativa,
 *    extensões interceptando, ou quando o document perde foco no
 *    momento do clique.
 *
 * 2. Fallback com document.execCommand('copy') via textarea hidden.
 *    API legada mas funciona em quase todos os cenários que a
 *    Clipboard API falha.
 *
 * Retorna `false` se ambas as tentativas falharem — nesse caso
 * o caller deve exibir o texto para o usuário copiar manualmente.
 */
export async function copyToClipboardSafe(text: string): Promise<boolean> {
  // Camada 1: Clipboard API moderna
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Falha silenciosa — cai para fallback
      console.warn("[clipboard] Clipboard API falhou, tentando fallback:", err);
    }
  }

  // Camada 2: execCommand (legacy mas resiliente)
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.padding = "0";
    textarea.style.border = "none";
    textarea.style.outline = "none";
    textarea.style.boxShadow = "none";
    textarea.style.background = "transparent";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";

    document.body.appendChild(textarea);

    // iOS precisa de seleção explícita
    const selection = document.getSelection();
    const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const ok = document.execCommand("copy");

    document.body.removeChild(textarea);

    // Restaura seleção anterior se havia
    if (savedRange && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    return ok;
  } catch (err) {
    console.error("[clipboard] execCommand fallback falhou:", err);
    return false;
  }
}

/**
 * The Translate Module
 * Show translated message below original message
 */

const access_token = ''; // https://ai.baidu.com/ai-doc/MT/4kqryjku9

async function translateText(text) {
    const context = {
        access_token,
        payload: JSON.stringify({"q": text, "from": "auto", "to": "zh"}),
    }
    const model = window.models.CreateModel('translate:translateapi')
    window.models.ApplyContextObject(model, context);
    await window.models.CallModel(model);
    window.models.DestroyModel(model);
}

async function handleTextSkill(event) {
    let emote = /\*.*\*/.exec(event.value);
    if (emote) return;

    await window.companion.WaitForTurn(async () => {
        // await new Promise(resolve => setTimeout(resolve, 3000)); // for testing message order
        await translateText(event.value);
    });
}

async function _handleApiResponse(response) {
    const translatedText = response.response.result.trans_result[0].dst;
    const name = window.companion.GetCharacterAttribute('name');
    if (translatedText) window.companion.SendMessage({type: "TEXT", user: name, value: translatedText});
}

export function init() {
    window.hooks.on("moemate_core:handle_skill_text", (event) => handleTextSkill(event));
    window.hooks.on('models:response:translate:translateapi', _handleApiResponse);
}
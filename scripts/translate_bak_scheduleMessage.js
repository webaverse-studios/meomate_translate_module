/**
 * The Translate Module
 * Show translated message below original message
 */

const access_token = ''; // https://ai.baidu.com/ai-doc/REFERENCE/Ck3dwjhhu

const dstLanguage = 'zh'; // https://ai.baidu.com/ai-doc/MT/4kqryjku9 Support 200+ languages, such as 'de', 'jp'

async function translateText(text) {
    const context = {
        access_token,
        payload: JSON.stringify({"q": text, "from": "auto", "to": dstLanguage}),
    }
    const model = window.models.CreateModel('translate:translateapi')
    window.models.ApplyContextObject(model, context);
    const response = await window.models.CallModel(model);
    const translatedText = response.result.trans_result[0].dst;
    window.models.DestroyModel(model);
    return translatedText;
}

async function speakText(text) {
    const context = {
        access_token,
        text,
        hightQuality: false,
        // hightQuality: false: QPS 10, and I have totally 50000 calls.
        // hightQuality: true:  QPS 2,  and I have totally 2000  calls only, maybe fail when you trying, and please use sparingly🙏.
    }
    const model = window.models.CreateModel('translate:voiceapi')
    window.models.ApplyContextObject(model, context);
    const stream_uuid = await window.models.CallModel(model, undefined, {stream: true, abortable: true, timeout: 20000});
    await window.companion.SendVoiceStream(stream_uuid);
    window.models.DestroyModel(model);
}

async function handleTextSkill(event) {
    let emote = /\*.*\*/.exec(event.value);
    if (emote) return;

    // await new Promise(resolve => setTimeout(resolve, 3000)); // for testing message order
    const translatedText = await translateText(event.value);
    if (!translatedText) return;
    const msgId = window.companion.ScheduleMessage({type: "TEXT", user: event.name, value: translatedText});
    await window.companion.WaitForTurn(async () => {
        if (msgId) {
            window.companion.ShowMessage(msgId);
            // if (dstLanguage === 'zh') await speakText(translatedText); // https://ai.baidu.com/ai-doc/SPEECH/mlbxh7xie Voice currently only support Chinese and English mixed mode
        }
    });
}

export function init() {
    window.hooks.on("moemate_core:handle_skill_text", (event) => handleTextSkill(event));
}
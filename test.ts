import { CommunicationService } from "./modules/communication/lib/communication-service";

async function test() {
  try {
    const res = await CommunicationService.listConversations("1");
    console.log("Success:", res.length);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();

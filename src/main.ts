import { CONFIGDATA, onOpen, getHello } from "./event";
(global as any).excuteMain = excuteMain;
global.onOpen = onOpen;

/**
 * @description main function
 * @author yoshitaka <sato-yoshitaka@aktio.co.jp>
 * @date 03/07/2025
 * @export
 */
export function excuteMain() {
  //補完がききます
  const message = CONFIGDATA.CONFIGMESSAGE;
  getHello(message);
}

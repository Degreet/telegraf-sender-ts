import { TelegrafContext } from "telegraf/typings/context";
import { ExtraEditMessage, ExtraSendMessage, Message } from 'telegraf/typings/telegram-types'

export interface Context extends TelegrafContext {
  msg?: {
    send: (text: string, extra?: ExtraSendMessage) => Promise<Message | void>
    sendTo: (userId: number, text: string, extra?: ExtraSendMessage) => Promise<Message | void>
    edit: (text: string, extra?: ExtraEditMessage) => Promise<Message | boolean | void>
    del: () => Promise<boolean | void>
    alert: (text: string) => Promise<boolean | void>
    toast: (text: string) => Promise<boolean | void>
    broadcast: (users: number[], callback?: Function, action?: (userId: number) => any) => boolean
  }
}

export function setupSender(ctx: Context, next: Function): void {
  ctx.msg = {
    send(text: string, extra?: ExtraSendMessage): Promise<Message | void> {
      return ctx
        .replyWithHTML(text, extra)
        .catch((e) => console.warn('msg.send error', e))
    },
    sendTo(userId: number, text: string, extra?: ExtraSendMessage): Promise<Message | void> {
      return ctx.telegram
        .sendMessage(userId, text, { parse_mode: 'HTML', ...extra })
        .catch((e) => console.warn('msg.sendTo error', e))
    },
    edit(text: string, extra?: ExtraEditMessage): Promise<Message | boolean | void> {
      return ctx
        .editMessageText(text, { parse_mode: 'HTML', ...extra })
        .catch((e) => console.warn('msg.edit error', e))
    },
    del(msgId?: number): Promise<boolean | void> {
      return ctx
        .deleteMessage(msgId)
        .catch((e) => console.warn('msg.del error', e))
    },
    alert(text: string): Promise<boolean | void> {
      return ctx
        .answerCbQuery(text, true)
        .catch((e) => console.warn('msg.alert error', e))
    },
    toast(text: string): Promise<boolean | void> {
      return ctx
        .answerCbQuery(text)
        .catch((e) => console.warn('msg.toast error', e))
    },
    broadcast(users: number[], callback?: Function, action?: (userId: number) => any): boolean {
      if (!callback || typeof callback !== 'function') callback = undefined
      if (!action || typeof action !== 'function') callback = undefined
      
      const resultUsers: number[][] = [[]]
      let activeUsersIndex: number = 0

      users.forEach((userId: number): void => {
        const last: number[] = resultUsers[resultUsers.length - 1]
        if (last.length < 30) last.push(userId)
        else resultUsers.push([userId])
      })

      function end(): void {
        if (callback) callback()
      }

      async function step(): Promise<void> {
        const startedAt: number = Date.now()
        const users: number[] | null | undefined = resultUsers[activeUsersIndex++]
        if (!users || users.length <= 0) return end()

        await Promise.all(
          users.map(async (userId: number): Promise<void> => {
            await ctx.telegram.sendCopy(userId, ctx.message).catch(() => {})
            if (action) action(userId)
          })
        )

        setTimeout(step, Math.max(0, startedAt + 1000 - Date.now()))
      }

      step()
      return true
    },
  }

  next()
}

import { Context } from 'telegraf/typings/context';
import { ExtraEditMessageText, ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { Message, Update } from 'telegraf/typings/core/types/typegram';

export interface Sender {
  msg?: {
    send: (text: string, extra?: ExtraReplyMessage) => Promise<Message | void>
    sendTo: (userId: number, text: string, extra?: ExtraReplyMessage) => Promise<Message | void>
    edit: (text: string, extra?: ExtraEditMessageText) => Promise<boolean | (Update.Edited & Message.TextMessage) | void>
    del: (msgId?: number) => Promise<boolean | void>
    alert: (text: string) => Promise<boolean | void>
    toast: (text: string) => Promise<boolean | void>
    broadcast: (users: number[], callback?: Function, action?: (userId: number) => any) => boolean
  }
}

export function setupSender(ctx: Context & Sender, next: Function): void {
  ctx.msg = {
    send(text: string, extra?: ExtraReplyMessage): Promise<Message.TextMessage | void> {
      return ctx
        .replyWithHTML(text, extra)
        .catch((e) => console.warn('msg.send error', e))
    },
    sendTo(userId: number, text: string, extra?: ExtraReplyMessage): Promise<Message.TextMessage | void> {
      return ctx.telegram
        .sendMessage(userId, text, { parse_mode: 'HTML', ...extra })
        .catch((e) => console.warn('msg.sendTo error', e))
    },
    edit(text: string, extra?: ExtraEditMessageText): Promise<boolean | (Update.Edited & Message.TextMessage) | void> {
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
        .answerCbQuery(text)
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
            await ctx.telegram.copyMessage(userId, userId, ctx.message?.message_id || 0).catch(() => {})
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

import config from 'config'
import { Markup } from 'telegraf';
import { Sender, setupSender } from './index'
import { Telegraf } from 'telegraf'
import { SceneContext } from 'telegraf/typings/scenes';
import { Context as TelegrafContext } from 'telegraf/typings/context';

type Context = SceneContext & TelegrafContext & Sender

const token: string = config.get<string>('botToken')
const bot: Telegraf<Context> = new Telegraf(token)

bot.use(setupSender)

bot.command('start', (ctx: Context): void => {
  const extra = {
    ...Markup.inlineKeyboard([
      [Markup.button.callback('Change text', 'change')],
      [Markup.button.callback('Delete', 'delete')],
      [Markup.button.callback('Toast', 'toast')],
      [Markup.button.callback('Alert', 'alert')],
    ])
  };

  ctx.msg?.send('Wait...', extra)
})

bot.action('change', (ctx: Context): void => {
  try {
    ctx.msg?.edit('Working!')
  } catch (e) {
    ctx.msg?.send('not working...(')
    console.warn('edit error', e)
  }
})

bot.action('delete', (ctx: Context): void => {
  try {
    ctx.msg?.del()
  } catch (e) {
    ctx.msg?.send('error')
    console.warn('delete error', e)
  }
})

bot.action('toast', (ctx: Context): void => {
  try {
    ctx.msg?.toast('Toast')
  } catch (e) {
    ctx.msg?.send('error')
    console.warn('toast error', e)
  }
})

bot.action('alert', (ctx: Context): void => {
  try {
    ctx.msg?.alert('Alert')
  } catch (e) {
    ctx.msg?.send('error')
    console.warn('alert error', e)
  }
})

bot.on('message', (ctx: Context): void => {
  try {
    const endCallback: Function = (): void => {
      console.log('Ended!')
    }

    const actionCallback: (userId: number) => any = (userId: number): void => {
      console.log(`Sending to: ${userId}`)
    }

    const users: number[] = config.get<number[]>('users')
    ctx.msg?.broadcast(users, endCallback, actionCallback)
  } catch (e) {
    ctx.msg?.send('error')
    console.warn('broadcast error', e)
  }
})

bot.launch().then((): void => console.log('Bot started!'))

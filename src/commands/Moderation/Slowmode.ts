import { Command } from 'discord-akairo'
import { Message, GuildChannel, GuildChannelResolvable, TextChannel } from 'discord.js'
import ms from 'ms'

import { secondsConvert, slowmodeRange, ZERO } from '../../utils/Constants'

export default class Slowmode extends Command {
    public constructor() {
        super('slowmode', {
            aliases: ['slowmode', 'sm'],
            category: 'Moderation',
            description: [
                {
                    content: 'Sets a slowmode in a channel',
                    usage: 'sm <channel> [timer]',
                    examples: ['sm 5m', 'sm #general 5s']
                }
            ],
            userPermissions: ['MANAGE_CHANNELS'],
            clientPermissions: ['MANAGE_CHANNELS'],
            ratelimit: 3,
            args: [
                {
                    id: 'channel',
                    type: 'string'
                },
                {
                    id: 'timer',
                    type: (_: Message, str: string): null | number => {
                        if (str) {
                            if (Number(ms(str))) return Number(ms(str))
                        }
                        
                        return null

                    }
                }
            ]
        })
    }

    public exec(message: Message, {channel, timer}: {channel: GuildChannelResolvable, timer: number}): Promise<Message> {
        let textChannel: GuildChannel

        if (channel) {

            ;(!message.mentions.channels.first() ? () => {
                timer = isNaN(parseInt(channel.toString())) ? timer : Number(ms(channel.toString()))
                textChannel = isNaN(parseInt(channel.toString())) ? message.guild.channels.resolve(channel) : message.guild.channels.resolve(message.channel.id)

                try {
                    textChannel.edit({'rateLimitPerUser': Math.floor(timer / secondsConvert)})
                    return message.util!.send('Slowmode set successfully.')
                } catch (err) {
                    console.log(err)
                    return message.util!.send('Please input a valid time.')
                }
            } : () => {
                textChannel = message.mentions.channels.first()

                try {
                    textChannel.edit({'rateLimitPerUser': Math.floor(timer / secondsConvert)})
                    return message.util!.send('Slowmode set successfully.')
                } catch(err) {
                    console.log(err)
                    return message.util!.send('HI I GOT HERE SOMEHOW')    
                }
            })()
        } else {
            return message.util!.send('Please provide a time.')
        }
    }
}
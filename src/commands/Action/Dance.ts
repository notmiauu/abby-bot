import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'

import { _GetAnimeSFW } from '../../util/Functions'

export default class Dance extends Command {
    public constructor() {
        super('dance', {
            aliases: ['dance', 'dances'],
            category: 'Action',
            description: {
                content: 'Look at you go with those moves!',
                usage: 'dance',
                examples: ['dance'],
            },
            ratelimit: 3
        })
    }

    public async exec(message: Message): Promise<Message> {        
        const dance = await _GetAnimeSFW('dance')
        
        return message.util!.send(new MessageEmbed()
            .setDescription(`**${message.author.tag}** is dancing. Look at them go!`)
            .setColor('RANDOM')
            .setImage(dance.url)
        )

    }
}
import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import moment from 'moment'

import { Colours } from '../../util/Colours'
import { MALLogo } from '../../util/Constants'

export default class Anime extends Command {
    public constructor() {
        super('anime', {
            aliases: ['anime', 'animeinfo', 'searchanime', 'findanime'],
            category: 'Anime',
            description: {
                content: 'Searches for anime and retrieves information from MyAnimeList.',
                usage: 'anime [query] <tag>',
                tags: ['-S (Special)', '-OV (OVA)', '-ON (ONA)', '-M (Movie)', '-TV (TV)'],
                examples: ['anime Demon Slayer', 'anime One Piece -M'],
            },
            channel: 'guild',
            ratelimit: 2,
            cooldown: 6e5,
            args: [
                {
                    id: 'query',
                    type: 'string',
                    match: 'rest'
                },
                {
                    id: 'media',
                    type: (_: Message, str: string) => { return str.caseCompare('-m', '-ov', '-on', '-s', '-tv') ? str.toLowerCase() : null },
                    match: 'phrase'

                }
            ]
        })
    }

    public async exec(message: Message, { query, media }: {query: string, media: string}): Promise<Message> {
        query = query?.replaceAll(media, '')?.trimEnd()
        if (!query) return message.channel.send('You need to provide a query to make a search. Please try again.')

        const mediaConversion = {
            '-m': 'movie',
            '-ov': 'ova',
            '-on': 'ona',
            '-s': 'special',
            '-tv': 'tv'
        }

        media = mediaConversion[media]

        const malquery = this.client.serviceHandler.modules.get('malquery')
        const res = await malquery.exec('anime', query, media || null)

        if (res.length === 1 || res[0].node.title.caseCompare(query.trim())) {
            const found = res[0].node

            return message.channel.send({ embeds: [this.animeEmbed(message, found)] }).finally(() => message.delete().catch(void 0))
        }
        else if (res.length > 1) {
            const inputService = this.client.serviceHandler.modules.get('getinput')

            try {
                const response = Number(await inputService.exec(
                    `${res.map((a: any, i: number) => `*[${i + 1}]* \`${a.node.title}\``).join('\n')}\n\n` +
                    `Please select between \`1 - ${res.length}\` of which anime to choose.`,
                    message.channel,
                    message.author.id,
                    true
                ))

                if (!response || isNaN(response)) throw new Error('You did not pick a valid option within the time limit, try again.')

                this.client.logger.log('ERROR', 'Reached here somehow')

                const found = res[response - 1].node

                return message.channel.send({ embeds: [this.animeEmbed(message, found)] }).finally(() => message.delete().catch(void 0))
            } catch (err) {
                return message.channel.send(err?.message || err)
            }
        }
        else return message.channel.send('Unfortunately no results were found or an error occurred, please try again.')
    }

    private animeEmbed(msg: Message, anime: any) {
        const createdValid = anime.created_at ? true : false
        const endedValid = anime.end_date ? true : false

        return new MessageEmbed()
            .setAuthor(`${anime.title.length > 30 ? anime.title.substring(0, 30).appendNoSpace('...') : anime.title} | ${anime.status.replaceAll('_', ' ')}`, MALLogo)
            .setThumbnail(anime.main_picture.medium)
            .setDescription(anime.synopsis.length > 512 ? anime.synopsis.substring(0, 512).appendNoSpace('...') : anime.synopsis)
            .setColor(Colours.SteelBlue)
            .addFields([
                { name: 'Alternative Titles', value: anime.alternative_titles.synonyms.map((s: string) => `\`${s}\``).join(', ') || 'No alternative titles' },
                { name: 'Episodes', value: anime?.num_episodes ? String(anime.num_episodes) : 'No episodes' },
                { 
                    name: 'Date aired', 
                    value: `${createdValid ? moment(new Date(anime.created_at)).format('YYYY/MM/DD HH:mm:ss') : 'Undetermined'} ` + 
                        `to ${endedValid ? moment(new Date(anime.end_date)).format('YYYY/MM/DD HH:mm:ss') : 'Undetermined'}` 
                },
                { name: 'Source', value: anime.source || 'Unknown', inline: true },
                { name: 'Type', value: anime.media_type || 'Unknown', inline: true },
                { name: 'Studio', value: anime.studios.map((s: any) => s.name).join(', ') || 'Unknown', inline: true },
                { name: 'Genres', value: anime.genres.map((g: any) => `\`${g.name}\``).join(', ') || 'Unlisted' },
            ])
            .setImage(anime.main_picture.large)
            .setFooter(`ID: #${anime.id} | Command ran by ${msg.author.tag} ❤`)
    }
}
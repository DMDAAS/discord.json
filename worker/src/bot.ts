import { verify } from './verify'
import { /* INSERT STUFF HERE */ } from './parser'
import {
  InteractionType,
  InteractionResponseType,
  APIInteractionResponse,
  APIApplicationCommandInteraction as Interaction,
} from 'discord-api-types/v9'
import { APIPingInteraction } from 'discord-api-types/payloads/v9/_interactions/ping'

// The actual bot //

export async function handleRequest(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  let publicKey = searchParams.get('public_key') || ""

  if (!request.headers.get('X-Signature-Ed25519') || !request.headers.get('X-Signature-Timestamp'))
    return Response.redirect('https://github.com/DMDaaS/discord.json')
  if (!await verify(publicKey, request))
    return new Response('', { status: 401 })

  const interaction = await request.json() as APIPingInteraction | Interaction

  if (interaction.type === InteractionType.Ping) {
    return respondComplex({
      type: InteractionResponseType.Pong
    })
  }

  let url = searchParams.get('url')
  if (url === null) {
    return new Response('', { status: 404 })
  }
  let response = await fetch(new Request(url))
  let config = await response.json()
  return processCommands(interaction, config)

  // let response = await fetch(new Request(`${url}/command_${interaction.data.name}.json`))
  // return new Response(
  //   responseBody, {
  //     headers: {'Content-Type': 'application/json'},
  //   })
}

async function processCommands(interaction: Interaction, config: object): Promise<Response> {

}

// Utility stuff //

async function respond(content: string): Promise<Response> {
  return respondComplex({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: content,
    }
  })
}

async function respondEphemeral(content: string): Promise<Response> {
  return respondComplex({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: content,
      flags: 1<<6,
    }
  })
}

async function respondComplex(response: APIInteractionResponse): Promise<Response> {
  return new Response(JSON.stringify(response), {headers: {'content-type': 'application/json'}})
}

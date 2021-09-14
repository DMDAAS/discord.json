import { verify } from './verify'
import { InteractionType, InteractionResponseType, APIInteractionResponse, RESTPostAPIChannelInviteJSONBody, APIInvite, ApplicationCommandOptionType, ChannelType, MessageFlags, APIApplicationCommandInteraction, InviteTargetType, RouteBases, Routes } from 'discord-api-types/v9'
import { APIPingInteraction } from 'discord-api-types/payloads/v9/_interactions/ping'

// The actual bot //

export async function handleRequest(request: Request): Promise<Response> {
  if (!request.headers.get('X-Signature-Ed25519') || !request.headers.get('X-Signature-Timestamp')) return Response.redirect('https://nwunder.com')
  if (!await verify(request)) return new Response('', { status: 401 })

  const interaction = await request.json() as APIPingInteraction | APIApplicationCommandInteraction

  if (interaction.type === InteractionType.Ping)
    return respondComplex({
      type: InteractionResponseType.Pong
    })

  return respond('Hello from Cloudflare workers!')
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

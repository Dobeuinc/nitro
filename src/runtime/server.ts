import { createRenderer } from 'vue-bundle-renderer'
import devalue from '@nuxt/devalue'

// @ts-ignore
import { renderToString } from '~renderer'
// @ts-ignore
import server from '~build/dist/server/server'
// @ts-ignore
import clientManifest from '~build/dist/server/client.manifest.json'
// @ts-ignore
import htmlTemplate from '~build/views/document.template.js'

const renderer = createRenderer(server, {
  clientManifest,
  renderToString
})

export async function render (url, ctx: any) {
  const start = process.hrtime()

  const ssrContext: any = {
    url,
    runtimeConfig: {
      public: {},
      private: {}
    },
    ...ctx
  }
  const rendered = await renderer.renderToString(ssrContext)

  const state = `<script>window.__NUXT__=${devalue(ssrContext.nuxt /* nuxt 2 */ || ssrContext.payload /* nuxt 3 */)}</script>`
  const _html = `<div id="__nuxt">${rendered.html}</div>`

  const html = htmlTemplate({
    HTML_ATTRS: '',
    HEAD_ATTRS: '',
    BODY_ATTRS: '',
    HEAD: rendered.renderResourceHints() + rendered.renderStyles() + (ssrContext.styles || ''),
    APP: _html + state + rendered.renderScripts()
  })

  const end = process.hrtime(start)
  const time = ((end[0] * 1e9) + end[1]) / 1e6

  return {
    html,
    status: 200,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'X-Nuxt-Coldstart': global._coldstart + 'ms',
      'X-Nuxt-ResponseTime': time + 'ms'
    }
  }
}
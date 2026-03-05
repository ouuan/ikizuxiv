<script setup lang="ts">
import {
  NA,
  NBlockquote,
  NH4,
  NLi,
  NModal,
  NP,
  NScrollbar,
  NText,
  NUl,
} from 'naive-ui';

const showDialog = defineModel<boolean>({ required: true });
</script>

<template>
  <n-modal
    v-model:show="showDialog"
    title="关于 ikizuXiv"
    preset="card"
    :auto-focus="false"
    :style="{ maxWidth: '520px' }"
  >
    <n-scrollbar :style="{ maxHeight: 'calc(90vh - 100px)' }">
      <n-p>
        这是一个非官方的
        <n-a href="https://www.lovelive-anime.jp/lovehigh/">
          IKIZULIVE! LOVELIVE! BLUEBIRD
        </n-a>
        <n-a href="https://x.com/i/lists/1921767698423521764">
          いきづらい部！
        </n-a>
        X 推文存档网站，包含原文、中文翻译、注释和 AI 配音（补全中）
      </n-p>
      <n-p>
        "ikizuXiv" 的 "Xiv" 来自 "archive"，读作 イキヅカイブ
      </n-p>
      <n-p>
        数据为手动更新，非实时最新数据
      </n-p>
      <n-p>
        翻译主要来自<n-a href="https://ikizutwizh.pikapaca.cc/">
          <span>羊驼</span>
        </n-a>（已获得转载授权；做出来之后才发现对方也做了网站，经商议，我们均保留各自的网站）
      </n-p>
      <n-h4>
        为什么要做这个网站？
      </n-h4>
      <n-p>
        <n-ul>
          <n-li>
            X 原站和 b 站动态发的翻译都不能跳转到某个日期，翻阅早期推文比较麻烦，并且原文和/或翻译是图片形式，不方便获取文字
          </n-li>
          <n-li>
            翻译不可避免会丢失一部分原文细节，有配音可以结合翻译和原文，比对照文字看方便（看番看出来的日语，一般听力更好）
          </n-li>
          <n-li>
            有配音和自动播放还可以录制成视频
          </n-li>
          <n-li>
            一开始没发现其他人做的类似网站（
          </n-li>
          <n-li>
            不需要那么多理由！
            <n-blockquote>
              これはどうだ？そんなのムリ！<br>
              否定はカンタン<br>
              気にするなよ 気にしないで動けばいいよ<br>
            </n-blockquote>
          </n-li>
        </n-ul>
      </n-p>
      <n-p>
        <n-text depth="2">
          <n-a href="https://github.com/ouuan/ikizuxiv">
            代码仓库
          </n-a>
          ·
          开发/维护者:
          <n-a href="https://ouuan.moe/about">
            ouuan
          </n-a>
          <br>
          License:
          <n-a href="https://spdx.org/licenses/AGPL-3.0-or-later.html">
            AGPL-3.0-or-later
          </n-a>
        </n-text>
      </n-p>
    </n-scrollbar>
  </n-modal>
</template>

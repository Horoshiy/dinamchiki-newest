// Маппинг строкового ключа иконки (приходит из контента / GraphQL)
// на Vue-компонент. Нужен потому, что бэкенд может отдать только строку.

import type { Component } from 'vue'
import type { IconKey } from '@/entities/content/content.types'
import IconTrophy from './IconTrophy.vue'
import IconUsers from './IconUsers.vue'
import IconBall from './IconBall.vue'
import IconAward from './IconAward.vue'
import IconShieldCheck from './IconShieldCheck.vue'
import IconCalendar from './IconCalendar.vue'
import IconStar from './IconStar.vue'
import IconHeart from './IconHeart.vue'
import IconBadge from './IconBadge.vue'

const ICONS: Readonly<Record<IconKey, Component>> = {
  trophy:   IconTrophy,
  users:    IconUsers,
  ball:     IconBall,
  award:    IconAward,
  shield:   IconShieldCheck,
  calendar: IconCalendar,
  star:     IconStar,
  heart:    IconHeart,
  badge:    IconBadge,
}

/** Компонент иконки по ключу. Неизвестный ключ → мяч (нейтральный дефолт). */
export function iconByKey(key: IconKey | string): Component {
  return ICONS[key as IconKey] ?? IconBall
}

<script setup lang="ts">
/** Подраздел 1 «Основные сведения» (`/sveden/common`). */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenFacts from '@/widgets/sveden/SvedenFacts.vue'
import { ORG, LICENSE, REQUISITES } from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage :num="1" title="Основные сведения" crumb="Основные сведения">
    <SvedenBlock title="Об организации">
      <SvedenFacts
        :items="[
          { label: 'Полное наименование', value: ORG.fullName, itemprop: 'fullName' },
          { label: 'Сокращённое наименование', value: ORG.shortName, itemprop: 'shortName' },
          { label: 'Дата создания', value: ORG.regDate, itemprop: 'regDate' },
        ]"
      />
    </SvedenBlock>

    <SvedenBlock title="Учредители">
      <div itemprop="uchredLaw" class="sv-founders">
        <p v-for="f in ORG.founders" :key="f" itemprop="nameUchred">{{ f }}</p>
      </div>
      <p class="sv-note">
        Учредители — физические лица. Сведения об адресе, телефоне и сайте учредителя
        не размещаются, поскольку организация учреждена не юридическим лицом
        и не публично-правовым образованием.
      </p>
    </SvedenBlock>

    <SvedenBlock title="Адрес, режим работы и контакты">
      <SvedenFacts
        :items="[
          { label: 'Место нахождения', value: ORG.address, itemprop: 'address' },
          { label: 'Режим и график работы', value: ORG.workTime, itemprop: 'workTime' },
          { label: 'Контактный телефон', value: ORG.phone, itemprop: 'telephone', href: ORG.phoneHref },
          { label: 'Адрес электронной почты', value: ORG.email, itemprop: 'email', href: `mailto:${ORG.email}` },
        ]"
      />
    </SvedenBlock>

    <SvedenBlock title="Места осуществления образовательной деятельности">
      <ul>
        <li v-for="p in ORG.places" :key="p" itemprop="addressPlaceSet">{{ p }}</li>
      </ul>
      <p class="sv-note">
        Указаны места осуществления образовательной деятельности, сведения о которых
        в соответствии с частью 4 статьи 91 Федерального закона № 273-ФЗ не включаются
        в запись реестра лицензий.
      </p>
    </SvedenBlock>

    <SvedenBlock title="Лицензия на осуществление образовательной деятельности">
      <SvedenFacts
        :items="[
          { label: 'Регистрационный номер', value: LICENSE.number },
          { label: 'Дата выдачи', value: LICENSE.date },
          { label: 'Лицензирующий орган', value: LICENSE.issuer },
          { label: 'Срок действия', value: LICENSE.term },
        ]"
      />
      <p>
        <a
          itemprop="licenseDocLink"
          :href="LICENSE.registryUrl"
          target="_blank"
          rel="noopener"
        >Выписка из реестра лицензий на осуществление образовательной деятельности</a>
      </p>
    </SvedenBlock>

    <SvedenBlock title="Реквизиты">
      <SvedenFacts
        :items="[
          { label: 'ИНН', value: REQUISITES.inn },
          { label: 'КПП', value: REQUISITES.kpp },
          { label: 'ОГРН', value: REQUISITES.ogrn },
          { label: 'Расчётный счёт', value: REQUISITES.account },
          { label: 'Банк', value: REQUISITES.bank },
          { label: 'БИК', value: REQUISITES.bik },
          { label: 'Корреспондентский счёт', value: REQUISITES.corrAccount },
        ]"
      />
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-founders {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  p { font-weight: $font-weight-medium; color: $color-fg-strong; }
}

.sv-note {
  font-size: $font-size-sm;
  color: $color-fg-muted;
}
</style>

<Screen
  id="Gesuche"
  _customShortcuts={[]}
  _hashParams={[]}
  _searchParams={[]}
  browserTitle=""
  title="Gesuche"
  urlSlug=""
  uuid="3f29df6e-5ade-45cb-8445-326d409546e7"
>
  <Frame
    id="$main"
    enableFullBleed={false}
    isHiddenOnDesktop={false}
    isHiddenOnMobile={false}
    padding="8px 12px"
    type="main"
  >
    <PDFViewer
      id="pdf1"
      hidden="{{ cascader1.valuePath == '' }}"
      retoolStorageFileId="5bca4e80-e8b8-4801-bb47-30955387688d"
      showTopBar={true}
      showZoomControls={true}
      src="https://drive.google.com/file/d/1CErBdWgmFof68Ewzqrb-fHD9fkixu31Z/view?usp=sharing"
      srcType="retoolStorageFileId"
    />
    <Container
      id="container1"
      footerPadding="4px 12px"
      headerPadding="4px 12px"
      heightType="fixed"
      padding="12px"
      showBody={true}
      showHeader={true}
    >
      <Header>
        <Text
          id="containerTitle1"
          value="#### Gesuche"
          verticalAlign="center"
        />
      </Header>
      <View id="00030" viewKey="View 1">
        <Cascader2
          id="cascader1"
          _captionByIndex={["", "", "", "", "", "", "", "", "", "", "", ""]}
          _colorByIndex={["", "", "", "", "", "", "", "", "", "", "", ""]}
          _disabledByIndex={[
            "",
            "",
            false,
            "",
            false,
            false,
            "",
            "",
            "",
            false,
            false,
            false,
          ]}
          _fallbackTextByIndex={[
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ]}
          _hasMigratedNestedItems={true}
          _hiddenByIndex={[
            "",
            "",
            false,
            "",
            false,
            false,
            "",
            "",
            "",
            false,
            false,
            false,
          ]}
          _iconByIndex={["", "", "", "", "", "", "", "", "", "", "", ""]}
          _ids={[
            "dcc59",
            "99f6e",
            "177f2",
            "e1fc5",
            "56881",
            "c293a",
            "00030",
            "00031",
            "00032",
            "96dd9",
            "88a31",
            "5d5fc",
          ]}
          _imageByIndex={["", "", "", "", "", "", "", "", "", "", "", ""]}
          _keyByIndex={[
            "6dc9f",
            "c21fc",
            "b8e15",
            "15bfc",
            "",
            "",
            "Pants-TEMPLATE_DEFAULT",
            "Denim-TEMPLATE_DEFAULT",
            "Jeans-TEMPLATE_DEFAULT",
            "0d4c0",
            "",
            "",
          ]}
          _labels={["", "", "", "", "", "", "", "", "", "", "", ""]}
          _parentKeyByIndex={[
            "",
            "6dc9f",
            "6dc9f",
            "c21fc",
            "b8e15",
            "b8e15",
            "",
            "Pants-TEMPLATE_DEFAULT",
            "Denim-TEMPLATE_DEFAULT",
            "Pants-TEMPLATE_DEFAULT",
            "0d4c0",
            "0d4c0",
          ]}
          _tooltipByIndex={["", "", "", "", "", "", "", "", "", "", "", ""]}
          _values={[
            "2023",
            "Final 2023",
            "Draft",
            "V2 FINAL",
            "V1 Draft",
            "V2 Draft",
            "2024",
            "Final",
            "V2 FINAL",
            "Draft",
            "V1 Draft",
            "V2 Draft",
          ]}
          emptyMessage="No options"
          itemMode="static"
          label="Jahr"
          labelPosition="top"
          labelWrap={true}
          overlayMaxHeight={375}
          placeholder="Select an option"
        >
          <Event
            event="change"
            method="scrollIntoView"
            params={{
              map: {
                options: { object: { block: "nearest", behavior: "auto" } },
              },
            }}
            pluginId="pdf1"
            type="widget"
            waitMs="0"
            waitType="debounce"
          />
        </Cascader2>
      </View>
    </Container>
  </Frame>
</Screen>

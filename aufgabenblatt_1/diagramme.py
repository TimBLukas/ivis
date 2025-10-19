import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px
import seaborn as sns


def read_csv(filepath: str) -> pd.DataFrame:
    """Liest eine CSV-Datei mit Semikolon als Trennzeichen ein."""
    return pd.read_csv(filepath, delimiter=";", header=0)


# 1. Scatterplot: horsepower vs. price
def scatter_hp_price(csv_content: pd.DataFrame) -> None:
    plt.figure(figsize=(7, 5))
    sns.scatterplot(
        data=csv_content, x="horsepower", y="price", hue="fueltype", alpha=0.7
    )
    plt.title("Preis in Abhängigkeit von der Motorleistung")
    plt.xlabel("Horsepower")
    plt.ylabel("Price")
    plt.tight_layout()
    plt.show()


# 2. Boxplot: Preis nach Karosserieform
def boxplot_price_carbody(csv_content: pd.DataFrame) -> None:
    plt.figure(figsize=(7, 5))
    sns.boxplot(data=csv_content, x="carbody", y="price", palette="Set2")
    plt.title("Preisverteilung nach Karosserieform")
    plt.xlabel("Car Body Type")
    plt.ylabel("Price")
    plt.tight_layout()
    plt.show()


# 3. Scatterplot: Leistung vs. Verbrauch
def scatter_hp_mpg(csv_content: pd.DataFrame) -> None:
    plt.figure(figsize=(7, 5))
    sns.scatterplot(
        data=csv_content, x="horsepower", y="citympg", hue="fueltype", alpha=0.7
    )
    plt.title("Leistung vs. Kraftstoffeffizienz (City MPG)")
    plt.xlabel("Horsepower")
    plt.ylabel("City MPG")
    plt.tight_layout()
    plt.show()


# 4. Scatterplot: Fahrzeugvolumen vs. Preis
def scatter_volume_price(csv_content: pd.DataFrame) -> None:
    df = csv_content.copy()
    for col in ["carlength", "carwidth", "carheight", "price"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["volume_m3"] = df["carlength"] * df["carwidth"] * df["carheight"] * (0.0254**3)

    plt.figure(figsize=(7, 5))
    sns.regplot(data=df, x="volume_m3", y="price", scatter_kws={"alpha": 0.6})
    plt.title("Preis in Abhängigkeit vom Fahrzeugvolumen")
    plt.xlabel("Fahrzeugvolumen (m³)")
    plt.ylabel("Price")
    plt.tight_layout()
    plt.show()


# 5. Heatmap: Korrelationen zwischen numerischen Variablen
def heatmap_correlations(csv_content: pd.DataFrame) -> None:
    corr = csv_content.corr(numeric_only=True)
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr, cmap="coolwarm", center=0)
    plt.title("Korrelationsmatrix der numerischen Variablen")
    plt.tight_layout()
    plt.show()


# 7. Markenanalyse: Top 10 Marken nach Durchschnittspreis
def bar_top_brands(csv_content: pd.DataFrame) -> None:
    df = csv_content.copy()
    df["brand"] = df["CarName"].str.split(" ").str[0]
    top = df.groupby("brand")["price"].mean().nlargest(10)

    plt.figure(figsize=(8, 5))
    sns.barplot(x=top.values, y=top.index, palette="viridis")
    plt.title("Top 10 Automarken nach Durchschnittspreis")
    plt.xlabel("Durchschnittspreis")
    plt.ylabel("Marke")
    plt.tight_layout()
    plt.show()


# 8. Pairplot: Überblick über technische Leistungsmerkmale
def pairplot_performance(csv_content: pd.DataFrame) -> None:
    subset = csv_content[["horsepower", "enginesize", "curbweight", "price"]].copy()
    subset = subset.apply(pd.to_numeric, errors="coerce")
    sns.pairplot(subset, diag_kind="kde")
    plt.suptitle("Beziehungen zwischen Leistungsmerkmalen", y=1.02)
    plt.show()


# 10. Hubraum und Preis
def plot_3d_performance(csv_content: pd.DataFrame) -> None:
    df = csv_content.copy()
    for col in ["horsepower", "enginesize", "price"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    fig = plt.figure(figsize=(8, 6))
    ax = fig.add_subplot(111, projection="3d")
    sc = ax.scatter(
        df["horsepower"],
        df["enginesize"],
        df["price"],
        c=df["price"],
        cmap="viridis",
        alpha=0.8,
    )
    ax.set_xlabel("Horsepower")
    ax.set_ylabel("Engine Size")
    ax.set_zlabel("Price")
    plt.title("3D-Beziehung: Leistung – Hubraum – Preis")
    plt.colorbar(sc, label="Price")
    plt.show()


# 11. PairGrid mit mehreren visuellen Kodierungen
def complex_pairgrid(csv_content: pd.DataFrame) -> None:
    cols = ["horsepower", "enginesize", "curbweight", "price"]
    df = csv_content[cols].apply(pd.to_numeric, errors="coerce")

    g = sns.PairGrid(df)
    g.map_lower(sns.scatterplot, alpha=0.6)
    g.map_diag(sns.kdeplot, fill=True)
    g.map_upper(sns.regplot, scatter=False, color="red")
    g.fig.suptitle("Komplexe multivariate Beziehungen", y=1.02)
    plt.show()


# 12. Bubble-Chart - Volumen, Leistung, Preis
def bubble_volume_hp_price(csv_content: pd.DataFrame) -> None:
    df = csv_content.copy()
    for col in ["carlength", "carwidth", "carheight", "horsepower", "price"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["volume_m3"] = df["carlength"] * df["carwidth"] * df["carheight"] * (0.0254**3)

    plt.figure(figsize=(8, 6))
    sns.scatterplot(
        data=df,
        x="volume_m3",
        y="horsepower",
        size="price",
        hue="fueltype",
        alpha=0.7,
        sizes=(50, 500),
    )
    plt.title("Bubble-Chart: Volumen, Leistung und Preis")
    plt.xlabel("Fahrzeugvolumen (m³)")
    plt.ylabel("Horsepower")
    plt.legend(title="Fuel Type", bbox_to_anchor=(1.05, 1))
    plt.tight_layout()
    plt.show()


# 13. Suburst (interaktiv) - Hierarchische Preisstruktur nach Marke & Karosserie
def sunburst_brand_carbody_price(csv_content: pd.DataFrame) -> None:
    df = csv_content.copy()
    df["brand"] = df["CarName"].str.split(" ").str[0]
    df["price"] = pd.to_numeric(df["price"], errors="coerce")

    fig = px.sunburst(
        df,
        path=["brand", "carbody"],
        values="price",
        color="price",
        color_continuous_scale="Viridis",
        title="Hierarchische Preisstruktur nach Marke und Karosserie",
    )
    fig.show()


# Main
def main() -> None:
    csv_content = read_csv("CarPrice_CSV_english.csv")

    scatter_hp_price(csv_content)
    boxplot_price_carbody(csv_content)
    scatter_hp_mpg(csv_content)
    scatter_volume_price(csv_content)
    heatmap_correlations(csv_content)
    bar_top_brands(csv_content)
    pairplot_performance(csv_content)
    plot_3d_performance(csv_content)
    complex_pairgrid(csv_content)
    bubble_volume_hp_price(csv_content)
    sunburst_brand_carbody_price(csv_content)


if __name__ == "__main__":
    main()
